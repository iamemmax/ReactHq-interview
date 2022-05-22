let active = false
const slide = () => {
    const ele = document.querySelector(".mobile-nav-parent")
    if (active) { //sliding up
        ele.classList.remove("slide-down")
        ele.classList.add("slide-up")
        active = false
    } else { //sliding down
        ele.classList.remove("slide-up")
        ele.classList.add("slide-down")
        // ele.focus()
        active = true
    }
}

const reviews = [
     "I’m very picky about the company I work for. For me, culture, growth and career progression are important. ReactHQ helped me to find a company that was a perfect match.",
    "Working with ReactHQ's clients makes it possible to work from home, the beach, a car, or even a coworking space. It allow me to work in an environment condusive for growth.",
    "ReactHQ is a very powerful platform, that helps us onboard highly skilled people quickly"
] 

// triggers when the window loads completely
window.onload = () => {
    const people = [...document.querySelectorAll(".person")]
    const comment = document.getElementById("comment")
    let currPerson = 0
    console.log(people.length);
    const next = () => {
        if (currPerson > 0) {
            people[currPerson - 1].classList.remove("fadeOut")
        }
        
        if (currPerson < people.length) {
                people[currPerson].classList.add("fadeOut")
                comment.textContent = reviews[currPerson]
                setTimeout( () => {
                    people[currPerson] && people[currPerson].classList.remove("fadeOut")
                    people[currPerson] && people[currPerson].classList.add(".fadeIn")
                }, 500)
                currPerson += 1
                console.log(currPerson);
            } else {
                currPerson = 0
            }
    }

    setInterval(() => next() ,1500)
}