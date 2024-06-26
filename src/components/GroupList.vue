<template>
  <div>
    <v-dialog v-model="listbox" max-width="500px">
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ $t('AddRemoveUsers') }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs9>
                  <v-autocomplete
                    v-model="selected"
                    :disabled="isLoading"
                    :items="allUsers"
                    autofocus
                    box
                    chips
                    :label="$t('Addusers')"
                    item-text="name"
                    item-value="id"
                    @change="addUser"
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        :selected="data.selected"
                        close
                        class="chip--select-multi"
                        @input="removeUser(data.item)"
                      >
                        <v-icon>mdi-account</v-icon>
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template v-slot:item="data">
                      <template v-if="false"></template>
                      <!-- <template v-if="(typeof data.item !== 'object')">
                        <v-list-item-content v-text="data.item" />
                      </template> -->
                      <template v-else>
                        <v-list-item-avatar>
                          <v-icon>mdi-account</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title v-html="data.item.name" />
                          <v-list-item-subtitle v-html="data.item.email" />
                        </v-list-item-content>
                      </template>
                    </template>
                  </v-autocomplete>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-title primary-title>
            <div>
              <div class="headline">
                {{ groupName }}
              </div>
              <span>{{ $t('UsersInGroup') }}</span>
            </div>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="item in groupUsers"
              :key="item.id"
              avatar
              @click="removeUser(item.id)"
            >
              <v-list-item-avatar>
                <v-icon>mdi-account</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-html="item.name" />
                <v-list-item-subtitle v-html="item.login" />
              </v-list-item-content>

              <v-list-item-action>
                <v-icon>
                  {{
                    item.status == 'active'
                      ? 'mdi-minus-circle'
                      : 'mdi-minus-circle-outline'
                  }}
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="close">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md12>
                  <v-chip
                    v-show="editedItem.name"
                    close
                    @click="editedItem.name = null"
                  >
                    <strong>{{ editedItem.name }}</strong
                    >&nbsp;
                    <span>({{ $t('group') }})</span>
                  </v-chip>
                </v-flex>
                <v-text-field
                  v-model.trim="editedItem.name"
                  :label="$t('Group')"
                  :rules="[rules.required]"
                  required
                />
                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Description')"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="close">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click="validate">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('Groups') }}
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="groups"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template v-slot:actions="">
          <v-btn
            v-has-perms.disable="'admin:groups'"
            icon
            plain
            class="mr-0"
            @click="editItem(props.item)"
          >
            <v-icon small color="grey darken-3">mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            v-has-perms.disable="'admin:groups'"
            icon
            plain
            class="mr-0"
            @click="addRemoveUsers(props.item)"
          >
            <v-icon small color="grey darken-3">mdi-account-plus</v-icon>
          </v-btn>
          <v-btn
            v-has-perms.disable="'admin:groups'"
            icon
            plain
            class="mx-0"
            @click="deleteItem(props.item)"
          >
            <v-icon small color="grey darken-3">mdi-delete</v-icon>
          </v-btn>
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="error" icon="mdi-alert">
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="mdi-alert">
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add
      v-show="isBasicAuth"
      perms="admin:groups"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd.vue'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd
  },
  data: () => ({
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['name'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('Name'), value: 'name' },
      { text: i18n.t('Description'), value: 'text' },
      { text: i18n.t('NumberUsers'), value: 'count' },
      { text: i18n.t('Actions'), value: 'actions', sortable: false }
    ],
    editedId: null,
    editedItem: {
      name: null,
      text: ''
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      name: null,
      text: ''
    },
    rules: {
      required: (v) => !!v || i18n.t('Required')
    },
    groupId: null,
    groupName: '',
    listbox: false,
    selected: null
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    groups() {
      return this.$store.state.groups.groups
    },
    groupUsers() {
      return this.$store.state.groups.users
    },
    allUsers() {
      return this.$store.state.users.users
    },
    isLoading() {
      return this.$store.state.groups.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewGroup') : i18n.t('EditGroup')
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    refresh(val) {
      val || this.getGroups()
    }
  },
  created() {
    this.getUsers()
    this.getGroups()
  },
  methods: {
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('groups/getGroups')
    },
    getGroupUsers(groupId) {
      this.$store.dispatch('groups/getGroupUsers', groupId)
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('groups/deleteGroup', item.id)
    },
    close() {
      this.dialog = false
      this.listbox = false
      setTimeout(() => {
        this.$refs.form.reset()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
        this.groupId = null
        this.groupName = ''
        this.$store.dispatch('groups/clearGroupUsers')
      }, 300)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('groups/updateGroup', [
          this.editedId,
          {
            name: this.editedItem.name,
            text: this.editedItem.text
          }
        ])
      } else {
        this.$store.dispatch('groups/createGroup', this.editedItem)
      }
      this.close()
    },
    addRemoveUsers(item) {
      this.groupId = item.id
      this.groupName = item.name
      this.getGroupUsers(this.groupId)
      this.listbox = true
    },
    addUser(userId) {
      this.$store.dispatch('groups/addUserToGroup', [this.groupId, userId])
      setTimeout(() => {
        this.$refs.form.reset()
        this.selected = null
      }, 300)
    },
    removeUser(userId) {
      this.$store.dispatch('groups/removeUserFromGroup', [this.groupId, userId])
    }
  }
}
</script>

<style scoped>
.v-list {
  height: 400px;
  overflow-y: auto;
}
</style>
