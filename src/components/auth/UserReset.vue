<template>
  <v-container grid-list-sm fill-height>
    <v-layout class="align-center" row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-sm-center headline font-weight-medium">
          <span>{{ $t('ChooseNewPassword') }}</span>
        </p>
        <v-form @submit.prevent="reset()">
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            outlined
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('ConfirmPassword')"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            outlined
            @click:append="showPassword = !showPassword"
          />
          <v-btn block color="primary" type="submit">
            {{ $t('ResetPassword') }}
          </v-btn>
        </v-form>
        <div class="text-sm-center">
          <span class="body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn flat color="primary" to="/login">
            {{ $t('SignIn') }}
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2 />
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: [],
  data: () => ({
    password: null,
    confirmPassword: null,
    showPassword: false
  }),
  methods: {
    reset() {
      this.$store
        .dispatch('auth/reset', [this.$route.params.token, this.password])
        .then(() => {
          /* give feedback to user that it worked, and auto-redirect? */
        })
    }
  }
}
</script>

<style></style>
