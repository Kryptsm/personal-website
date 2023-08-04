<script>
import HelloWorld from "./components/HelloWorld.vue";
import Header from "./components/Header.vue";
import PersonalBanner from "./components/PersonalBanner.vue";
import ProfileActions from "./components/ProfileActions.vue";
import Notification from "./components/Notification.vue";

export default {
	components: {
		Header,
		PersonalBanner,
		ProfileActions,
		Notification,
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
