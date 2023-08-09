<script setup>
import Header from "./components/shared/Header.vue";
</script>

<template>
	<Header />
	<div class="mx-auto max-w-7xl">
		<router-view></router-view>
	</div>
</template>

<style scoped></style>
