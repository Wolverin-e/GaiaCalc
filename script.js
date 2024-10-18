const {
    createApp,
    ref,
    computed,
} = Vue

createApp({
    setup() {

        const jobBoardsUsed = ref(0)
        const jobPostingPerMonth = ref()
        const avgAppsPerJobPosting = ref()
        const frequencyOfOverlap = ref('')
        const monthlySpendOnJobBoards = ref()

        const allValuesFilled = computed(() => {
            if(jobBoardsUsed.value === 0) return false
            if(!jobPostingPerMonth.value) return false
            if(!avgAppsPerJobPosting.value) return false
            if(frequencyOfOverlap.value === '') return false
            if(!monthlySpendOnJobBoards.value) return false

            return true
        })

        const baselineOverlapRate = computed(() => {

            const x = jobBoardsUsed.value
            if (x > 0 && x <= 2) {
                return 30;
            } else if (x > 2 && x <= 5) {
                return 50;
            } else if (x > 5 && x <= 10) {
                return 70;
            } else if (x > 10 && x <= 15) {
                return 80;
            }

            return 0;
        })

        const adjustedOverlapRate = computed(() => {
            let adjustment

            switch (frequencyOfOverlap.value) {
                case "Rarely":
                    adjustment = -5;
                    break;
                case "Occasionally":
                    adjustment = 0;
                    break;
                case "Often":
                    adjustment = 5;
                    break;
                case "Very Often":
                    adjustment = 10;
                    break;
                default:
                    adjustment = 0;
            }

            return baselineOverlapRate.value + adjustment
        })

        const estimatedMonthlyWastedSpend = computed(() => {
            return monthlySpendOnJobBoards.value * adjustedOverlapRate.value / 100
        })
        const potentialMonthlySavings = computed(() => {
            return monthlySpendOnJobBoards.value * (adjustedOverlapRate.value - 20) / 100
        })


        return {
            jobBoardsUsed,
            jobPostingPerMonth,
            avgAppsPerJobPosting,
            frequencyOfOverlap,
            monthlySpendOnJobBoards,

            // Derivations
            allValuesFilled,
            baselineOverlapRate,
            adjustedOverlapRate,
            estimatedMonthlyWastedSpend,
            potentialMonthlySavings,
        }
    }
}).mount('#calc-app')
