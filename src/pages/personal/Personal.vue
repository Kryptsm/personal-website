<script setup>
import PersonalBanner from "./components/PersonalBanner.vue";
import ProfileActions from "./components/ProfileActions.vue";
</script>

<template>
	<div class="personal">
		<PersonalBanner />
		<ProfileActions />
	</div>
</template>

<style scoped>
.personal {
	margin-bottom: 40px;
}
</style>
