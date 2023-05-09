<template>
	<Modal
		:show-container="showContainer"
		:show-modal="showModal"
		:z-index="1005"
		@close="close"
		@after-leave="afterLeave"
	>
		<div class="loginModal">
			<h4>NYT Login</h4>
			<div class="loginGrid">
				<div>
					Username:
				</div>
				<input
					v-model="login.username"
					class="textInput"
				>
                
				<div>Password:</div>
				<input
					v-model="login.password"
					class="textInput"
				>
				<div />
			</div>
			<div class="buttons">
				<button
					class="button darkGreyButton secondaryButton"
					@click="close"
				>
					Cancel
				</button>
				<button
					class="button blueButton primaryButton"
					@click="login"
				>
					Login
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">

import {computed, ref} from 'vue';

import Modal from '@/components/Modal.vue';
import {useStore} from '@/store/store';



const store = useStore();

const showModal = computed(() => store.showLogin);
const showContainer = computed(() => store.showLoginContainer);

const login = ref({
	username: '',
	password: ''
});



function close(): void {
	store.hideLogin();
}

function afterLeave(): void {
	store.hideLoginContainer();
}

</script>

<style scoped>

.loginModal{
    width:calc( 35 * var(--base-size));
}

.loginGrid{
    display: grid;
    grid-template-columns: 30% 55%;
    column-gap:calc( 1 * var(--base-size));
    row-gap: calc(.5 * var(--base-size));
}




.buttons{
    padding-top:calc( 3 * var(--base-size));
}

</style>