<script setup>
import Header from "./pages/shared/Header.vue";
import { Authenticator } from "@aws-amplify/ui-vue";
</script>

<template>
	<Header />
	<div class="mx-auto max-w-5xl background-light">
		<router-view></router-view>
	</div>
</template>

<style>
.authenticator {
	margin-top: 30px;
}

.background-main {
	background-color: #8965d9;
	border: 5px solid #ea7d1c;
}

.background-light,
#app {
	background-color: #f5f3fc;
}
</style>
