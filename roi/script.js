const { computePosition, offset, arrow, shift, limitShift } = FloatingUIDOM

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
        const rolesAdvertisedText = ref('')
        const rolesAdvertised = ref(null)
        const rolesOpenBeyondTargetText = ref('')
        const rolesOpenBeyondTarget = ref(null)

        // For cheeky comma in numeric values Field: 1000000 -> 1,000,000
        const textNumericValuePairs = [
            [rolesAdvertisedText, rolesAdvertised],
            [rolesOpenBeyondTargetText, rolesOpenBeyondTarget],
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
        const roiValue = computed(() => {
            if(rolesAdvertised.value === null || rolesOpenBeyondTarget.value === null) return null;

            return Math.round((rolesAdvertised.value - rolesOpenBeyondTarget.value) * 100 / rolesAdvertised.value)
        })

        const performanceLevel = computed(() => {
            if(roiValue.value === null) return null

            if(roiValue.value <= 33){
                return "weak"
            } else if(34 <= roiValue.value && roiValue.value <= 67){
                return "moderate"
            } else if(68 <= roiValue.value && roiValue.value <= 90){
                return "good"
            } else {
                return "excellent"
            }
        })


        // Form validation
        const onceSubmittedSuccessfully = ref(false)
        const rolesAdvertisedInput = ref(null)
        const rolesOpenBeyondTargetInput = ref(null)

        // For tooltips
        const showTooltipFor = (elem, text = "tooltip", arrowXOffset = 50) => {

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
                    shift(),
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
                    left: arrowX != null ? `${arrowX - arrowXOffset}px` : '',
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
            if(rolesAdvertised.value === null) return false
            if(rolesOpenBeyondTarget.value === null) return false

            return true
        })

        const onSubmit = () => {
            if(rolesAdvertised.value === null) return showInvalid(rolesAdvertisedInput.value, rolesAdvertisedInput.value.parentElement)
            if(rolesOpenBeyondTarget.value === null) return showInvalid(rolesOpenBeyondTargetInput.value, rolesOpenBeyondTargetInput.value.parentElement)

            onceSubmittedSuccessfully.value = true
            window.history.pushState({ roiFormSubmitted: true }, '') // push a state
        }

        window.history.replaceState({ roiFormSubmitted: false }, '') // set initial state

        // Reset the state
        window.addEventListener('popstate', () => {
            if(onceSubmittedSuccessfully.value && window.history.state.roiFormSubmitted === false){
                onceSubmittedSuccessfully.value = false
                rolesAdvertisedText.value = ''
                rolesOpenBeyondTargetText.value = ''
            }
        })


        // For info tooltips
        // const numberofRolesAdvertisedInfoIcon = ref(null)
        const rolesOpenBeyondTargetInfoIcon = ref(null)

        const tooltipContentPairs = [
            // [numberofRolesAdvertisedInfoIcon, "#recruitment-tooltip-content"],
            [rolesOpenBeyondTargetInfoIcon, "#retention-tooltip-content"],
        ]

        const initAdsTooltips = () => {
            tooltipContentPairs.forEach(([iconElementRef, content_selector]) => {

                if(!iconElementRef.value) return

                let shiftRightByPx = 120

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
                            offset({
                                crossAxis: shiftRightByPx,
                                mainAxis: 7,
                            }),
                            arrow({ element: arrowDiv }),
                            shift(),
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
                            left: arrowX != null ? `${arrowX}px` : '',
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


        // Some utilities
        const focusInputWithin = (e) => {
            e.target.querySelector('input')?.focus()
        }


        return {
            // State
            rolesAdvertisedText,
            rolesAdvertised,
            rolesOpenBeyondTargetText,
            rolesOpenBeyondTarget,
          
            // Derivations
            roiValue,
            performanceLevel,

            // Utility
            focusInputWithin,

            // Form validation
            onceSubmittedSuccessfully,
            allValuesFilled,
            onSubmit,
            rolesAdvertisedInput,
            rolesOpenBeyondTargetInput,

            // Info Tooltip
            // numberofRolesAdvertisedInfoIcon,
            rolesOpenBeyondTargetInfoIcon,
        }
    }
}).mount('#calc-app')