const { computePosition, offset, arrow } = FloatingUIDOM

const {
    createApp,
    ref,
    computed,
    onMounted,
    watch,
    nextTick,
} = Vue

createApp({
    setup() {

        // State vars
        // const recruitmentCostSavingsText = ref('131')
        // const recruitmentCostSavings = ref(131)
        // const retentionSavingsText = ref('12,332')
        // const retentionSavings = ref(12332)
        // const directHireSavingsText = ref('353')
        // const directHireSavings = ref(353)
        // const brandingCostsText = ref('232')
        // const brandingCosts = ref(232)
        const recruitmentCostSavingsText = ref('')
        const recruitmentCostSavings = ref(null)
        const retentionSavingsText = ref('')
        const retentionSavings = ref(null)
        const directHireSavingsText = ref('')
        const directHireSavings = ref(null)
        const brandingCostsText = ref('')
        const brandingCosts = ref(null)

        // For cheeky comma in numeric values Field: 1000000 -> 1,000,000
        const textNumericValuePairs = [
            [recruitmentCostSavingsText, recruitmentCostSavings],
            [retentionSavingsText, retentionSavings],
            [directHireSavingsText, directHireSavings],
            [brandingCostsText, brandingCosts],
        ]
        textNumericValuePairs.forEach(([text, numeric]) => {
            watch(text, (newValue) => {
                const result = newValue.replace(/\D/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
                nextTick(() => {
                    text.value = result
                });
    
                // Maintain numberOfEmployees numeric depending upon the textual value
                const numericString = result.replace(/\D/g, "")
                numeric.value = numericString !== "" ? Math.floor(numericString || 0) : null
            })
        })

        // Computed Values
        const totalBenefits = computed(() => {
            if(recruitmentCostSavings.value === null
                || retentionSavings.value === null
                || directHireSavings.value === null
                || brandingCosts.value === null
            ) return null

            return recruitmentCostSavings.value + retentionSavings.value + directHireSavings.value + brandingCosts.value
        })

        const roiValue = computed(() => {
            if(totalBenefits.value === null || brandingCosts.value === null) return null

            return (totalBenefits.value - brandingCosts.value) / brandingCosts.value
        })

        const performanceLevel = computed(() => {
            if(roiValue.value === null) return null

            if(roiValue.value < 0){
                return "needs_improvement"
            } else if(0 <= roiValue.value && roiValue.value <= 50){
                return "moderate_performance"
            } else { // ROI > 50
                return "strong_performance"
            }
        })


        // Form validation
        const onceSubmittedSuccessfully = ref(false)
        const numberOfEmployeesInput = ref(null)
        const recruitmentCostSavingsInput = ref(null)
        const retentionSavingsInput = ref(null)
        const directHireSavingsInput = ref(null)
        const brandingCostsInput = ref(null)

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

        const isEmpty = x => x === undefined || x === ""

        const allValuesFilled = computed(() => {
            if(recruitmentCostSavings.value === null) return false
            if(retentionSavings.value === null) return false
            if(directHireSavings.value === null) return false
            if(brandingCostsText.value === null) return false

            return true
        })

        const onSubmit = () => {

            if(recruitmentCostSavings.value === null) return showInvalid(recruitmentCostSavingsInput.value, recruitmentCostSavingsInput.value.parentElement)
            if(retentionSavings.value === null) return showInvalid(retentionSavingsInput.value, retentionSavingsInput.value.parentElement)
            if(directHireSavings.value === null) return showInvalid(directHireSavingsInput.value, directHireSavingsInput.value.parentElement)
            if(brandingCosts.value === null) return showInvalid(brandingCostsInput.value, brandingCostsInput.value.parentElement)

            onceSubmittedSuccessfully.value = true
        }


        // For info tooltips
        const recruitmentCostSavingsInfoIcon = ref(null)
        const retentionSavingsInfoIcon = ref(null)
        const directHireSavingsInfoIcon = ref(null)
        const brandingCostsInfoIcon = ref(null)

        const tooltipContentPairs = [
            [recruitmentCostSavingsInfoIcon, "#recruitment-tooltip-content"],
            [retentionSavingsInfoIcon, "#recruitment-tooltip-content"],
            [directHireSavingsInfoIcon, "#recruitment-tooltip-content"],
            [brandingCostsInfoIcon, "#recruitment-tooltip-content"],
        ]

        const initAdsTooltips = () => {
            tooltipContentPairs.forEach(([iconElementRef, content_selector]) => {

                if(!iconElementRef.value) return

                let shiftRightByPx = 60

                const tooltipDivElem = document.createElement('div')
                tooltipDivElem.className = 'info-tooltip'
                tooltipDivElem.setAttribute('role', 'tooltip')
                document.body.appendChild(tooltipDivElem)

                const arrowDivElem = document.createElement('div')
                arrowDivElem.className = 'arrow'
                tooltipDivElem.appendChild(arrowDivElem)

                const content = document.querySelector(content_selector)
                if(content){
                    // append the content
                    tooltipDivElem.appendChild(content.cloneNode(true))

                    // Assign the shiftRight if there
                    if(content.dataset.shiftRight) shiftRightByPx = parseInt(content.dataset.shiftRight)
                } else {
                    console.warn("No content found for tolltip: ", content_selector)
                }

                const updateAdsInfoTooltip = (elem = iconElementRef.value, tooltipDiv = tooltipDivElem, arrowDiv = arrowDivElem) => {
                    computePosition(elem, tooltipDiv, {
                        placement: 'bottom',
                        middleware: [
                            offset(7),
                            arrow({ element: arrowDiv }),
                        ]
                    }).then(({x, y, placement, middlewareData}) => {
                        Object.assign(tooltipDiv.style, {
                            left: `${x + shiftRightByPx}px`,
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
                            left: arrowX != null ? `${arrowX - shiftRightByPx}px` : '',
                            top: arrowY != null ? `${arrowY}px` : '',
                            right: '',
                            bottom: '',
                            [staticSide]: '-4px',
                        });
                    })
                }

                const displayTooltip = () => {
                    setTimeout(() => {
                        tooltipDivElem.style.display = 'block'
                        updateAdsInfoTooltip()
                    }, 200)
                }

                const hideTooltip = () => {
                    setTimeout(() => tooltipDivElem.style.display = 'none', 400)
                }

                [
                    ['mouseenter', displayTooltip],
                    ['mouseleave', hideTooltip],
                    ['focus', displayTooltip],
                    ['blur', hideTooltip],
                ].forEach(([event, listener]) => {
                    iconElementRef.value.addEventListener(event, listener);
                });
            })
        }

        onMounted(() => {
            initAdsTooltips()
        })


        return {
            // State
            recruitmentCostSavingsText,
            recruitmentCostSavings,
            retentionSavingsText,
            retentionSavings,
            directHireSavingsText,
            directHireSavings,
            brandingCostsText,
            brandingCosts,

            // Derivations
            totalBenefits,
            roiValue,
            performanceLevel,

            // Form validation
            onceSubmittedSuccessfully,
            numberOfEmployeesInput,
            allValuesFilled,
            onSubmit,
            recruitmentCostSavingsInput,
            retentionSavingsInput,
            directHireSavingsInput,
            brandingCostsInput,

            // Info Tooltip
            recruitmentCostSavingsInfoIcon,
            retentionSavingsInfoIcon,
            directHireSavingsInfoIcon,
            brandingCostsInfoIcon,
        }
    }
}).mount('#calc-app')