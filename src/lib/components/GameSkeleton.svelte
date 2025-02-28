<script lang="ts">
    import Icon from "@iconify/svelte";
</script>

<div class="flex justify-center items-center">
    <div class="inline-block rounded-3xl card bg-base-100">
        <div class="card-body pb-5">
            <div
                class="flex justify-center items-center text-shadow-soft shadow-base-content"
            >
                Loading matchup data...
            </div>
            <div
                class="flex justify-center items-center pt-2 text-2xl font-bold gap-3 text-shadow-soft shadow-base-content"
            >
                <div class="w-10 h-10 rounded-full skeleton"></div>
                <div class="w-24 h-6 skeleton"></div>
                <Icon
                    icon="mdi:arrow-right-thick"
                    class="text-shadow-soft shadow-base-content"
                />
                <div class="w-10 h-10 rounded-full skeleton"></div>
                <div class="w-24 h-6 skeleton"></div>
            </div>
            <div class="flex justify-center mt-3">
                <div
                    class="badge badge-ghost rounded-full text-shadow-soft shadow-neutral-600 text-neutral-600"
                >
                    Loading...
                </div>
            </div>
        </div>
    </div>
</div>
