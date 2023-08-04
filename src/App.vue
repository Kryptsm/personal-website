<script>
import Header from "./components/shared/Header.vue";

export default {
	components: {
		Header,
	},
	data() {
		return {};
	},
};
</script>

<template>
	<Header />
	<router-view></router-view>
</template>

<style scoped></style>
