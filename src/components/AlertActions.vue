<template>
  <div>
    <v-container v-if="!showForm" class="pa-1" fluid>
      <v-layout class="actions">
        <v-btn
          v-if="!isWatched"
          outlined
          color="grey darken-2"
          @click="watchAlert"
        >
          <v-icon>mdi-eye</v-icon>&nbsp;{{ $t('Watch') }}
        </v-btn>

        <v-btn
          v-if="isWatched"
          outlined
          color="grey darken-2"
          @click="unwatchAlert"
        >
          <v-icon>mdi-eye-off</v-icon>&nbsp;{{ $t('Unwatch') }}
        </v-btn>

        <v-btn
          v-if="!showForm"
          outlined
          color="grey darken-2"
          @click="showForm = true"
        >
          <v-icon>mdi-note-plus</v-icon>&nbsp;{{ $t('AddNote') }}
        </v-btn>

        <v-btn
          outlined
          color="grey darken-2"
          @click="deleteAlert"
          v-has-perms="'admin:alerts'"
        >
          <v-icon>mdi-delete-forever</v-icon>&nbsp;{{ $t('Delete') }}
        </v-btn>
      </v-layout>
    </v-container>

    <v-container v-if="showForm" class="pa-1" fluid>
      <v-layout>
        <v-flex>
          <v-form ref="form" v-model="valid" lazy-validation @submit="addNote">
            <v-card>
              <v-card-text>
                <v-text-field
                  v-model.trim="text"
                  :counter="maxNoteLength"
                  :maxlength="maxNoteLength"
                  :minlength="minNoteLength"
                  :rules="textRules"
                  :label="$t('AddNote')"
                  prepend-icon="mdi-pencil"
                  required
                />
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="!isAcked && !isClosed"
                  color="green"
                  class="white--text"
                  @click="takeAction('open')"
                >
                  <v-icon>mdi-refresh</v-icon>&nbsp;{{ $t('Open') }}
                </v-btn>

                <v-btn
                  v-show="!isAcked"
                  :disabled="!isOpen"
                  color="blue darken-2"
                  class="white--text"
                  @click="ackAlert()"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>&nbsp;{{ $t('Ack') }}
                </v-btn>

                <v-btn
                  v-show="isAcked"
                  color="blue darken-2"
                  class="white--text"
                  @click="takeAction('unack')"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>&nbsp;{{
                    $t('Unack')
                  }}
                </v-btn>

                <v-btn
                  v-show="!isShelved"
                  :disabled="!isOpen && !isAcked"
                  color="blue"
                  class="white--text"
                  @click="shelveAlert()"
                >
                  <v-icon>mdi-clock-outline</v-icon>&nbsp;{{ $t('Shelve') }}
                </v-btn>

                <v-btn
                  v-show="isShelved"
                  color="blue"
                  class="white--text"
                  @click="takeAction('unshelve')"
                >
                  <v-icon>mdi-clock-outline</v-icon>&nbsp;{{ $t('Unshelve') }}
                </v-btn>

                <v-btn
                  :disabled="isClosed"
                  color="orange"
                  class="white--text"
                  @click="takeAction('close')"
                >
                  <v-icon>mdi-close-circle-outline</v-icon>&nbsp;{{
                    $t('Close')
                  }}
                </v-btn>

                <v-btn color="white" @click="addNote">
                  <v-icon>mdi-note-plus</v-icon>&nbsp;{{ $t('AddNote') }}
                </v-btn>

                <v-spacer />

                <v-btn icon @click="close">
                  <v-icon color="grey darken-1">mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import i18n from '@/plugins/i18n'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    isWatched: {
      type: Boolean,
      required: true
    }
  },
  data: (vm) => ({
    showForm: false,
    valid: true,
    text: '',
    maxNoteLength: 200,
    minNoteLength: 0,
    textRules: [
      (v) => !!v || i18n.t('TextIsRequired'),
      (v) =>
        (v && v.length <= vm.maxNoteLength) ||
        `${i18n.t('TextMustBeLessThan')} ${vm.maxNoteLength} ${i18n.t(
          'characters'
        )}`
    ]
  }),
  computed: {
    isOpen() {
      return this.status == 'open' || this.status == 'NORM'
    },
    isAcked() {
      return this.status == 'ack' || this.status == 'ACKED'
    },
    isShelved() {
      return this.status == 'shelved' || this.status == 'SHLVD'
    },
    isClosed() {
      return this.status == 'closed'
    }
  },
  methods: {
    takeAction: debounce(
      function (action) {
        this.$emit('take-action', this.id, action, this.text)
        this.close()
      },
      200,
      { leading: true, trailing: false }
    ),
    ackAlert: debounce(
      function () {
        this.$emit('ack-alert', this.id, this.text)
        this.close()
      },
      200,
      { leading: true, trailing: false }
    ),
    shelveAlert: debounce(
      function () {
        this.$emit('shelve-alert', this.id, this.text)
        this.close()
      },
      200,
      { leading: true, trailing: false }
    ),
    watchAlert: debounce(
      function () {
        this.$emit('watch-alert', this.id)
      },
      200,
      { leading: true, trailing: false }
    ),
    unwatchAlert: debounce(
      function () {
        this.$emit('unwatch-alert', this.id)
      },
      200,
      { leading: true, trailing: false }
    ),
    addNote: debounce(
      function () {
        this.$emit('add-note', this.id, this.text)
        this.close()
      },
      200,
      { leading: true, trailing: false }
    ),
    deleteAlert: debounce(
      function () {
        this.$emit('delete-alert', this.id)
      },
      200,
      { leading: true, trailing: false }
    ),
    close() {
      this.text = null
      this.showForm = false
    }
  }
}
</script>

<style>
.actions {
  gap: 0.75rem;
  padding: 0 1rem 1rem;
}
</style>
