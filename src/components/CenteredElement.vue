<template>
	<div :class="{maxHeight: maxHeight}">
		<div
			class="containter"
			:class="{centerText: centerText}"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
	maxHeight?: boolean;
	centerText?: boolean;
}>(), {
	maxHeight: false,
	centerText: false
});

</script>

<style scoped>

.maxHeight{
    height: 100%;
}

.container{
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.centerText{
    text-align: center;
    align-items: center;
}


</style>