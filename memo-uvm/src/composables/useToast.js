import { reactive } from 'vue'

const state = reactive({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle-outline',
  timeout: 4000,
})

export const toast = {
  show(message, color = 'success', icon = '', timeout = 4000) {
    state.message = message
    state.color = color
    state.timeout = timeout

    if (!icon) {
      switch (color) {
        case 'success':
          state.icon = 'mdi-check-circle-outline'
          break
        case 'error':
          state.icon = 'mdi-alert-circle-outline'
          break
        case 'warning':
          state.icon = 'mdi-alert-outline'
          break
        case 'info':
          state.icon = 'mdi-information-outline'
          break
        default:
          state.icon = 'mdi-bell-outline'
      }
    } else {
      state.icon = icon
    }

    state.show = false
    setTimeout(() => {
      state.show = true
    }, 50)
  },
  success(message, timeout = 4000) {
    this.show(message, 'success', 'mdi-check-circle-outline', timeout)
  },
  error(message, timeout = 4000) {
    this.show(message, 'error', 'mdi-alert-circle-outline', timeout)
  },
  warning(message, timeout = 4000) {
    this.show(message, 'warning', 'mdi-alert-outline', timeout)
  },
  info(message, timeout = 4000) {
    this.show(message, 'info', 'mdi-information-outline', timeout)
  },
  hide() {
    state.show = false
  }
}

export function useToastState() {
  return state
}
