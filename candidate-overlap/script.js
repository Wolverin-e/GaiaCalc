const { computePosition, offset, arrow } = FloatingUIDOM

const {
    createApp,
    ref,
    computed,
    onMounted,
} = Vue

createApp({
    setup() {

        const jobBoardsUsed = ref(0)
        const jobPostingPerMonth = ref()
        const avgAppsPerJobPosting = ref()
        const frequencyOfOverlap = ref('')
        const monthlySpendOnJobBoards = ref()

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


        // Form validation
        const onceSubmittedSuccessfully = ref(false)
        const jobBoardsUsedSelect = ref(null)
        const jobPostingPerMonthInput = ref(null)
        const avgAppsPerJobPostingInput = ref(null)
        const frequencyOfOverlapSelect = ref(null)
        const monthlySpendOnJobBoardsInput = ref(null)

        // For tooltips
        const showTooltipFor = (elem, text = "tooltip", arrowXOffset = -50) => {

            const tooltipDiv = document.createElement('div')
            tooltipDiv.id = 'tooltip'
            tooltipDiv.setAttribute('role', 'tooltip')
            document.body.appendChild(tooltipDiv)

            const arrowDiv = document.createElement('div')
            arrowDiv.id = 'arrow'
            tooltipDiv.appendChild(document.createTextNode(text))
            tooltipDiv.appendChild(arrowDiv)


            computePosition(elem, tooltipDiv, {
                placement: 'bottom',
                middleware: [
                    offset(7),
                    arrow({ element: arrowDiv }),
                ]
            }).then(({x, y, placement, middlewareData}) => {
                Object.assign(tooltipDiv.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                })

                const { x: arrowX, y: arrowY } = middlewareData.arrow

                const staticSide = {
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                }[placement.split('-')[0]];

                Object.assign(arrowDiv.style, {
                    left: arrowX != null ? `${arrowX + arrowXOffset}px` : '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                });
            })

            // For cleaning up tooltip
            let removed = false
            const cleanUp = () => {
                if(!removed) tooltipDiv.remove()
                removed = true
            }

            elem.addEventListener('focus', cleanUp, { once: true })
            elem.addEventListener('blur', cleanUp, { once: true })
            elem.addEventListener('click', cleanUp, { once: true })
            document.addEventListener('keypress', cleanUp, { once: true })
            document.addEventListener('focusout', cleanUp, { once: true })

            return cleanUp
        }

        const showInvalid = (elem, tooltipElem, message = "Ops! You missed something.") => {
            elem.classList.add("invalid")
            elem.focus()
            elem.addEventListener('change', () => elem.classList.remove("invalid"), { once: true })
            elem.addEventListener('input', () => elem.classList.remove("invalid"), { once: true })
            showTooltipFor(tooltipElem ?? elem, message)
        }

        const allValuesFilled = computed(() => {
            if(jobBoardsUsed.value === 0) return false
            if(!jobPostingPerMonth.value) return false
            if(!avgAppsPerJobPosting.value) return false
            if(frequencyOfOverlap.value === '') return false
            if(!monthlySpendOnJobBoards.value) return false

            return true
        })

        const onSubmit = () => {

            const isEmpty = x => x === undefined || x === ""

            if(jobBoardsUsed.value === 0) return showInvalid(jobBoardsUsedSelect.value, jobBoardsUsedSelect.value.parentElement)
            if(isEmpty(jobPostingPerMonth.value)) return showInvalid(jobPostingPerMonthInput.value, jobPostingPerMonthInput.value.parentElement)
            if(isEmpty(avgAppsPerJobPosting.value)) return showInvalid(avgAppsPerJobPostingInput.value, avgAppsPerJobPostingInput.value.parentElement)
            if(isEmpty(frequencyOfOverlap.value)) return showInvalid(frequencyOfOverlapSelect.value, frequencyOfOverlapSelect.value.parentElement)
            if(isEmpty(monthlySpendOnJobBoards.value)) return showInvalid(monthlySpendOnJobBoardsInput.value, monthlySpendOnJobBoardsInput.value.parentElement.parentElement)

            onceSubmittedSuccessfully.value = true
        }


        return {
            // State
            jobBoardsUsed,
            jobPostingPerMonth,
            avgAppsPerJobPosting,
            frequencyOfOverlap,
            monthlySpendOnJobBoards,

            // Derivations
            baselineOverlapRate,
            adjustedOverlapRate,
            estimatedMonthlyWastedSpend,
            potentialMonthlySavings,

            // Form validation
            onceSubmittedSuccessfully,
            jobBoardsUsedSelect,
            jobPostingPerMonthInput,
            avgAppsPerJobPostingInput,
            frequencyOfOverlapSelect,
            monthlySpendOnJobBoardsInput,
            allValuesFilled,
            onSubmit,
        }
    }
}).mount('#calc-app')
