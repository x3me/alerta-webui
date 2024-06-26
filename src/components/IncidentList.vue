<template>
  <v-data-iterator
    :options.sync="pagination"
    :server-items-length="pagination.totalItems"
    :items="incidents"
    disable-sort
    :footer-props="{
      showCurrentPage: true,
      ...pagination
    }"
    :loading="loading"
    class="d-flex flex-column gap-2"
  >
    <template v-slot:header="{ options, sort }">
      <v-data-table-header
        class="incident-header"
        :headers="headers"
        :options="options"
        sort-icon="mdi-chevron-up"
        @sort="sort"
      />
    </template>
    <template v-slot:default="{ items }">
      <v-sheet
        v-for="incident in items"
        :key="incident.id"
        :class="`incident-row severity-${incident.alertSeverity}`"
        :color="rowColour"
        tabindex="0"
        @click="open(incident.id)"
      >
        <span class="label">{{ incident.status | capitalize }}</span>
        <span :class="`label label-${incident.severity}`">
          {{ incident.severity | capitalize }}
        </span>
        <date-format
          v-if="incident.lastReceiveTime"
          :value="incident.lastReceiveTime"
        >
          <template v-slot:default="{ on }">
            <span v-on="on">
              {{ incident.lastReceiveTime | timeago(timestampFormat) }}
            </span>
          </template>
        </date-format>
        <span v-else class="grey--text">No alerts</span>
        <span>{{ incident.createTime | hhmmss }}</span>
        <date-format :value="incident.updateTime">
          <template v-slot:default="{ on }">
            <span v-on="on">
              {{ incident.updateTime | timeago(timestampFormat) }}
            </span>
          </template>
        </date-format>

        <span>{{ incident.title }}</span>
        <span class="ellipsize">
          {{ $tc('AlertsCnt', incident.alerts.length) }}
        </span>
        <div class="d-flex align-center ellipsize">
          <span class="ellipsize">
            {{ incident.owner.name }}
          </span>
        </div>

        <div class="actions" @click.stop>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                :disabled="
                  !isAcked(incident.status) && !isClosed(incident.status)
                "
                icon
                plain
                @click.stop="takeAction(incident.id, 'open')"
              >
                <v-icon size="20px">mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Open') }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-show="!isAcked(incident.status)"
                v-on="on"
                :disabled="!isOpen(incident.status)"
                icon
                plain
                @click.stop="ackIncident(incident.id)"
              >
                <v-icon size="20px">mdi-check</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Ack') }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-show="isAcked(incident.status)"
                v-on="on"
                icon
                plain
                @click.stop="takeAction(incident.id, 'unack')"
              >
                <v-icon size="20px">mdi-undo</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Unack') }}</span>
          </v-tooltip>

          <close-incident-confirm :incident="incident" :callback="getIncidents">
            <template v-slot:activator="{ on: dialogAction }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="dialogAction.click"
                    :disabled="isClosed(incident.status)"
                    icon
                    plain
                    class="px-1 mx-0"
                  >
                    <v-icon size="20px">mdi-close-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Close') }}</span>
              </v-tooltip>
            </template>
          </close-incident-confirm>
        </div>

        <div class="note flex-grow-1">
          <div v-if="incident.note">
            <p>
              {{ incident.note.user }}:
              {{ incident.note.text.trim() }}
              <span class="grey--text">
                ({{ incident.note.createTime | timeago('narrow') }})
              </span>
            </p>
          </div>
          <div v-else></div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                @on="on"
                icon
                plain
                elevation="1"
                small
                @click.stop="$emit('createNote', incident)"
              >
                <v-icon small>mdi-note-plus</v-icon>
              </v-btn>
            </template>
            <span>Add Note</span>
          </v-tooltip>
        </div>
        <div class="tags flex-grow-1" @click.stop="$emit('editTags', incident)">
          Tags:
          <v-chip small v-for="tag in incident.tags" :key="tag">
            {{ tag }}
          </v-chip>
        </div>
      </v-sheet>
    </template>
  </v-data-iterator>
</template>

<script lang="ts">
import CloseIncidentConfirm from '@/components/CloseIncidentConfirm.vue'
import DateFormat from '@/components/lib/DateFormat.vue'
import { IIncidents } from '@/store/interfaces'
import { debounce } from 'lodash'
import Vue, { PropType } from 'vue'
import { DataTableHeader } from 'vuetify'

export default Vue.extend({
  props: {
    incidents: [] as PropType<IIncidents['incidents']>
  },
  components: {
    CloseIncidentConfirm,
    DateFormat
  },
  data() {
    return {
      headers: [
        {
          text: 'Status',
          value: 'status',
          sortable: false
        },
        {
          text: 'Severity',
          value: 'severity',
          sortable: false
        },
        {
          text: 'Last Received',
          value: 'lastReceiveTime'
        },
        {
          text: 'Duration',
          value: 'createTime'
        },
        {
          text: 'Last Updated',
          value: 'updateTime'
        },
        {
          text: 'Title',
          value: 'title',
          sortable: false
        },
        {
          text: 'Alerts',
          value: 'alerts',
          sortable: false
        },
        {
          text: 'Assignee',
          value: 'owner',
          sortable: false
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'center'
        }
      ] as DataTableHeader[],
      windowWidth: window.innerWidth,
      timestampFormat: window.innerWidth < 1200 ? 'narrow' : 'long'
    }
  },
  mounted() {
    this.$nextTick(() => window.addEventListener('resize', this.onResize))
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  computed: {
    rowColour() {
      return ''
      // return `grey ${this.$vuetify.theme.dark ? 'darken-3' : 'lighten-3'}`
    },
    loading() {
      return this.$store.state.incidents.isLoading
    },
    users() {
      return this.$store.state.users.users
    },
    pagination: {
      get() {
        return this.$store.state.incidents.pagination
      },
      set(value) {
        this.$store.dispatch('incidents/setPagination', value)
      }
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    }
  },
  watch: {
    windowWidth(val) {
      this.timestampFormat = val < 1200 ? 'narrow' : 'long'
    }
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth
    },
    getIncidents() {
      this.$emit('getIncidents')
    },
    getUsers() {
      if (!this.$store.state.users.users?.length)
        this.$store.dispatch('users/getUsers')
    },
    open(id: string) {
      this.$router.push({ name: 'incident', params: { id } })
    },
    isOpen(status: string) {
      return status == 'open' || status == 'NORM'
    },
    isAcked(status: string) {
      return status == 'ack' || status == 'ACKED'
    },
    isShelved(status: string) {
      return status == 'shelved' || status == 'SHLVD'
    },
    isClosed(status: string) {
      return status == 'closed'
    },
    takeAction: debounce(
      function (id: string, action: string, text?: string) {
        // @ts-ignore
        this.$store
          // @ts-ignore
          .dispatch('incidents/takeAction', [id, action, text])
          // @ts-ignore
          .then(this.getIncidents)
      },
      200,
      { leading: true, trailing: false }
    ),
    ackIncident(id: string) {
      this.$store
        .dispatch('incidents/takeAction', [id, 'ack', null, this.ackTimeout])
        .then(this.getIncidents)
    },
    getEnvironments() {
      this.$store.dispatch('incidents/getEnvironments')
    },
    setEnv(env: string) {
      this.$store.dispatch('incidents/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    }
  }
})
</script>

<style lang="scss">
.incident-row,
.incident-header > tr {
  display: grid;

  grid-template-columns: 1fr 1fr 2fr 1.5fr 2fr max(25rem, 40%) 1fr 1.5fr 1.75fr;
  gap: 0.5rem;
  padding-inline: 1rem;

  user-select: none;
}

.incident-header > tr {
  align-items: center;
}

.incident-row {
  align-items: flex-start;

  width: 100%;
  padding-block: 0.5rem;
  border-radius: 0.5rem;
  transition: outline 0.2s ease-in-out;
  outline-color: transparent;

  cursor: pointer;

  &:focus {
    outline: 2px solid var(--v-primary-base);
  }

  .label {
    width: max-content;
  }

  &.severity-cleared {
    padding-left: 0.5rem;
    border-left: 8px solid var(--v-success-base);
  }
}

.ellipsize {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gap-2 {
  gap: 0.5rem;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;
  grid-row-end: span 2;
  cursor: default;
}

.note {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  grid-column-end: span 5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  grid-column-end: span 3;
}
</style>
