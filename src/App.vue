<script setup>
import Header from "./pages/shared/Header.vue";
import { Authenticator } from "@aws-amplify/ui-vue";
</script>

<template>
	<Authenticator>
		<template v-slot="{ user, signOut }">
			<Header />
			<div class="mx-auto max-w-7xl">
				<router-view></router-view>
			</div>
		</template>
	</Authenticator>
</template>

<style>
.authenticator {
	margin-top: 30px;
}
</style>
