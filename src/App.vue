<script>
import Header from "./components/shared/Header.vue";
import PersonalBanner from "./components/personal/PersonalBanner.vue";
import ProfileActions from "./components/personal/ProfileActions.vue";

export default {
	components: {
		Header,
		PersonalBanner,
		ProfileActions,
	},
	data() {
		return {};
	},
};
</script>

<template>
	<Header />
	<PersonalBanner />
	<ProfileActions />
</template>

<style scoped></style>
