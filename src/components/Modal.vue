<template>
	<div
		v-show="showContainer"
		class="modalContainer"
	>
		<transition 
			name="fade"
			@after-leave="emit('afterLeave')"
		>
			<div
				v-show="showModal"
				class="maxWidth"
			>
				<div
					class="modalBackground"
					:style="{zIndex: zIndex}"
					:class="{blurredBackground: blurredBackground}"
					@click="emit('close')"
				/>
				<div
					class="modal horizontallyCenter"
					:style="{zIndex: zIndex + 1}"
				>
					<slot />
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
	showContainer: boolean;
	showModal: boolean;
	zIndex?: number;
	blurredBackground?: boolean;
}>(), {
	zIndex: 999,
	blurredBackground: true
});


const emit = defineEmits<{
	(event: 'close'): void;
	(event: 'afterLeave'): void;
}>();

</script>

<style scoped>

.modalBackground {
    position: fixed;
    z-index: 999;
    left:0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top:calc(2 * var(--base-size));
}

.blurredBackground {
	background-color: rgba(0, 0, 0, 0.4);
}

.modal {
  padding:calc(2 * var(--base-size));
  background-color: #fefefe;
  margin: 5% auto 40% auto;
  border: 1px solid #888;
  border-radius: 5px;
  position: fixed;
  max-height: 75vh;
  overflow: auto;
  z-index: 1000;

}

.modalContainer{
    width: 100%
}



.fade-enter-active {
    transition: opacity 0.2s;
}

.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}

</style>