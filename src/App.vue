<script setup>
import Header from "./pages/shared/Header.vue";
</script>

<template>
	<Header />
	<div class="mx-auto max-w-7xl">
		<router-view></router-view>
	</div>
</template>

<style>
.authenticator {
	margin-top: 30px;
}
</style>
