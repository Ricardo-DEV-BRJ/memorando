<script setup>
import { useTheme } from 'vuetify'

const theme = useTheme()

const toggleTheme = () => {
    const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
    theme.change(newTheme)
}
</script>

<template>
    <div> 
        <v-btn size="small" :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="toggleTheme" />
    </div>
</template>
