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
        const typeSelected = ref('Managed')
        const numberOfEmployeesText = ref('')
        const numberOfEmployees = ref('')
        const aiCreditsSelected = ref(null)
        const numberOfAdsSelected = ref(null)

        // Localisation
        const isRegionUS = computed(() => {
            const url = new URL(window.location.href)
            return url.searchParams.get('region') === 'us'
        })

        const regionCurrencySymbol = computed(() => {
            if(isRegionUS.value) return '$'
            return '£'
        })

        function regionifyAmount(amount){
            if(!isRegionUS.value) return amount
            if(typeof amount !== "number") return

            return amount * 1.22
        }

        // For cheeky comma in numberOfEmployees Field: 1000000 -> 1,000,000
        watch(numberOfEmployeesText, (newValue) => {
            const result = newValue.replace(/\D/g, "")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            nextTick(() => {
                numberOfEmployeesText.value = result
            });

            // Maintain numberOfEmployees numeric depending upon the textual value
            const numericString = result.replace(/\D/g, "")
            numberOfEmployees.value = numericString !== "" ? Math.floor(numericString || 0) : ""
        })

        // Options for Select
        const numberOfAdsOpts = [1, 25, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975, 1000];
        const aiCreditsOpts = [0, 10000, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000]


        const employeesRounded  = computed(() => {
            // console.log("number=>", numberOfEmployees.value);

            if(typeof numberOfEmployees.value !== "number") return 1000

            if (numberOfEmployees.value < 1000) {
                return 1000;
            } else {
                // Round up to the nearest multiple of 5000
                return Math.ceil(numberOfEmployees.value / 5000) * 5000;
            }
        })

        // Computed Values
        const monthlyPricingCoreSolution = computed(() => {

            // Sample data for 'Pricing Pilot', 'Pricing Managed', and 'Pricing Self Serve'
            const pricingManaged = {
                1000: 2812.50,
                5000: 5625,
                10000: 11250,
                15000: 22500,
                20000: 45000,
                25000: 90000,
                30000: 180000,
                35000: 360000,
                40000: 720000,
                45000: 1440000,
                50000: 2880000,
                55000: 5760000,
                60000: 11520000,
                65000: 23040000,
                70000: 46080000,
                75000: 92160000,
                80000: 184320000,
                85000: 368640000,
                90000: 737280000,
                95000: 1474560000,
                100000: 2949120000,
            }

            const pricingPilot = {
                1000: 1856.25,
                5000: 3712.50,
                10000: 7425,
                15000: 14850,
                20000: 29700,
                25000: 59400,
                30000: 118800,
                35000: 237600,
                40000: 475200,
                45000: 950400,
                50000: 1900800,
                55000: 3801600,
                60000: 7603200,
                65000: 15206400,
                70000: 30412800,
                75000: 60825600,
                80000: 121651200,
                85000: 243302400,
                90000: 486604800,
                95000: 973209600,
                100000: 1946419200,
            }

            const pricingSelfServe = {
                1: "Freemium",
                25: 799,
                75: 1899,
                100: 2499,
                125: 3099,
                150: 3699,
                175: 4299,
                200: 4899,
                225: 5499,
                250: 6099,
                275: 6699,
                300: 7299,
                325: 7899,
                350: 8499,
                375: 9099,
                400: 9699,
                425: 10299,
                450: 10899,
                475: 11499,
                500: 12099,
                525: 12699,
                550: 13299,
                575: 13899,
                600: 14499,
                625: 15099,
                650: 15699,
                675: 16299,
                700: 16899,
                725: 17499,
                750: 18099,
                775: 18699,
                800: 19299,
                825: 19899,
                850: 20499,
                875: 21099,
                900: 21699,
                925: 22299,
                950: 22899,
                975: 23499,
                1000: 24099,
            }      

            function hLookup(value, table) {
                if (table.hasOwnProperty(value)) {
                    return table[value];
                }

                return null;
            }


            if(typeSelected.value === 'Pilot') {
                return regionifyAmount(hLookup(employeesRounded.value, pricingPilot));  // Lookup in 'Pricing Pilot'
            } else if (typeSelected.value === "Managed") {
                return regionifyAmount(hLookup(employeesRounded.value, pricingManaged));  // Lookup in 'Pricing Managed'
            } else if (typeSelected.value === "Self Serve") {
                return regionifyAmount(hLookup(numberOfAdsSelected.value, pricingSelfServe));  // Lookup in 'Pricing Self Serve'
            } else {
                return null;  // Default value if no match
            }
        })

        const monthlyPricingAIExtras = computed(() => {
            const pricing = {
                0: 0,
                10000: 799,
                50000: 3999,
                100000: 7999,
                150000: 11999,
                200000: 15999,
                250000: 19999,
                300000: 23999,
                350000: 27999,
                400000: 31999,
                500000: 39999,
                600000: 47999,
                700000: 55999,
                800000: 63999,
                900000: 71999,
                1000000: 79999,
            }
            
            return regionifyAmount(pricing[aiCreditsSelected.value] ?? "")
        })

        const quarterlyPricingPilot = computed(() => {
            return typeSelected.value === "Pilot" && typeof monthlyPricingCoreSolution.value === "number"
                ? monthlyPricingCoreSolution.value * 3
                : null
        })

        const yearlyPricingManaged = computed(() => {
            return (typeSelected.value === "Managed" || typeSelected.value === "Self Serve") && typeof monthlyPricingCoreSolution.value === "number"
                ? monthlyPricingCoreSolution.value * 12
                : null
        })

        const aiCreditsWithCoreSolution = computed(() => {

            const pricingData = {
                1: 1000,
                25: 25000,
                75: 75000,
                100: 100000,
                125: 125000,
                150: 150000,
                175: 175000,
                200: 200000,
                225: 225000,
                250: 250000,
                275: 275000,
                300: 300000,
                325: 325000,
                350: 350000,
                375: 375000,
                400: 400000,
                425: 425000,
                450: 450000,
                475: 475000,
                500: 500000,
                525: 525000,
                550: 550000,
                575: 575000,
                600: 600000,
                625: 625000,
                650: 650000,
                675: 675000,
                700: 700000,
                725: 725000,
                750: 750000,
                775: 775000,
                800: 800000,
                825: 825000,
                850: 850000,
                875: 875000,
                900: 900000,
                925: 925000,
                950: 950000,
                975: 975000,
                1000: 1000000,
            };

            return typeSelected.value === "Self Serve"
                ? pricingData[numberOfAdsSelected.value] ?? null
                : "UNLIMITED"
        })

        const aiCreditsAdditionalPurchased = computed(() => {
            return aiCreditsSelected.value
        })

        const totalAICredits = computed(() => {
            if(typeSelected.value !== "Self Serve"){
                return "UNLIMITED"
            }
            if(typeof aiCreditsWithCoreSolution.value !== "number") return "UNLIMITED"
            if(typeof aiCreditsAdditionalPurchased.value !== "number") return aiCreditsWithCoreSolution.value
            return aiCreditsWithCoreSolution.value + aiCreditsAdditionalPurchased.value
        })


        // For Disabling unnecessary fields
        const isNumberOfEmployeesUnnecessary = computed(() => {
            return typeSelected.value === 'Self Serve'
        })

        const isAiCreditsUnnecessary = computed(() => {
            return typeSelected.value === 'Managed' || typeSelected.value === 'Pilot'
        })

        const isNumberOfAdsUnnecessary = computed(() => {
            return typeSelected.value === 'Managed' || typeSelected.value === 'Pilot'
        })


        // Form validation
        const onceSubmittedSuccessfully = ref(false)
        const typeSelect = ref(null)
        const numberOfEmployeesInput = ref(null)
        const numberOfAdsSelect = ref(null)

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
            if(!typeSelected.value) return false
            if(!isNumberOfEmployeesUnnecessary && !numberOfEmployees.value) return false
            if(!isNumberOfAdsUnnecessary.value && !numberOfAdsSelected.value) return false
            if((typeSelected.value === 'Pilot') && (!isNumberOfEmployeesUnnecessary.value) && numberOfEmployees.value < 10) return false
            if((typeSelected.value === 'Managed') && (!isNumberOfEmployeesUnnecessary.value) && isEmpty(numberOfEmployees.value)) return false

            return true
        })

        const onSubmit = () => {

            if(typeSelected.value === null) return showInvalid(typeSelect.value, typeSelect.value.parentElement)
            if((!isNumberOfEmployeesUnnecessary.value) && isEmpty(numberOfEmployees.value)) return showInvalid(numberOfEmployeesInput.value, numberOfEmployeesInput.value.parentElement)
            if((typeSelected.value === 'Pilot') && (!isNumberOfEmployeesUnnecessary.value) && numberOfEmployees.value < 10) {
                return showInvalid(numberOfEmployeesInput.value, numberOfEmployeesInput.value.parentElement, "Please enter a value of 10 or above.")
            }
            if((!isNumberOfAdsUnnecessary.value) && numberOfAdsSelected.value === null) return showInvalid(numberOfAdsSelect.value, numberOfAdsSelect.value.parentElement)

            onceSubmittedSuccessfully.value = true
        }


        // Simple Debounce Implementation
        function debounce(fn, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        }

        // For showing Invalid once the form is submitted
        watch(numberOfEmployees, debounce((newValue) => {
            if (!onceSubmittedSuccessfully.value) return;
            if (typeSelected.value !== 'Pilot') return;

            if (newValue >= 10) return;

            showInvalid(numberOfEmployeesInput.value, numberOfEmployeesInput.value.parentElement, "Please enter a value of 10 or above.")
        }, 300));


        // For info tooltip
        const adsInfoIcon = ref(null)

        const initAdsTooltip = () => {
            if(!adsInfoIcon.value) return

            const shiftRightByPx = 60

            const adsInfoTooltipDiv = document.createElement('div')
            adsInfoTooltipDiv.id = 'info-tooltip'
            adsInfoTooltipDiv.setAttribute('role', 'tooltip')
            document.body.appendChild(adsInfoTooltipDiv)

            const adsArrowDiv = document.createElement('div')
            adsArrowDiv.className = 'arrow'
            adsInfoTooltipDiv.appendChild(document.createTextNode(`AI credits = Number of ads`))
            adsInfoTooltipDiv.appendChild(document.createElement(`br`))
            adsInfoTooltipDiv.appendChild(document.createTextNode(`1,000 AI credits = 1 ad`))
            adsInfoTooltipDiv.appendChild(document.createElement(`br`))
            adsInfoTooltipDiv.appendChild(document.createTextNode(`25,000 AI credits = 25 ads`))
            adsInfoTooltipDiv.appendChild(adsArrowDiv)

            const updateAdsInfoTooltip = (elem = adsInfoIcon.value, tooltipDiv = adsInfoTooltipDiv, arrowDiv = adsArrowDiv) => {
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
                    adsInfoTooltipDiv.style.display = 'block'
                    updateAdsInfoTooltip()
                }, 200)
            }

            const hideTooltip = () => {
                setTimeout(() => adsInfoTooltipDiv.style.display = 'none', 400)
            }

            [
                ['mouseenter', displayTooltip],
                ['mouseleave', hideTooltip],
                ['focus', displayTooltip],
                ['blur', hideTooltip],
            ].forEach(([event, listener]) => {
                adsInfoIcon.value.addEventListener(event, listener);
            });
        }

        onMounted(() => {
            initAdsTooltip()
        })


        return {
            // State
            typeSelected,
            numberOfEmployeesText,
            numberOfEmployees,
            aiCreditsSelected,
            numberOfAdsOpts,
            aiCreditsOpts,
            numberOfAdsSelected,
            isRegionUS,

            // Derivations
            employeesRounded,
            monthlyPricingCoreSolution,
            monthlyPricingAIExtras,
            quarterlyPricingPilot,
            yearlyPricingManaged,
            aiCreditsWithCoreSolution,
            aiCreditsAdditionalPurchased,
            totalAICredits,
            regionCurrencySymbol,

            // Form validation
            onceSubmittedSuccessfully,
            typeSelect,
            numberOfEmployeesInput,
            numberOfAdsSelect,
            allValuesFilled,
            onSubmit,
            isAiCreditsUnnecessary,
            isNumberOfAdsUnnecessary,

            // Info Tooltip
            adsInfoIcon,
        }
    }
}).mount('#calc-app')
