import { grooveGrinds } from "./src/data/groove-grinds.js";
import { soulGrinds } from "./src/data/soul-grinds.js";
import { specialNameGrinds } from "./src/data/special-name-grinds.js";
import { variations } from "./src/data/variations.js";
  
  let selectedLists = [
    ...getRandomHalf(grooveGrinds), 
    ...getRandomHalf(soulGrinds), 
    ...getRandomHalf(specialNameGrinds),
  ];
  const listMap = {
    'groove-grinds': grooveGrinds,
    'soul-grinds': soulGrinds,
    'special-name-grinds': specialNameGrinds
  }
  let sectors = getRandomHalf(selectedLists);
  let tot = sectors.length
  const rand = (m, M) => Math.random() * (M - m) + m
  const spinEl = document.querySelector('#spin')
  const ctx = document.querySelector('#wheel').getContext('2d')
  const dia = ctx.canvas.width
  const rad = dia / 2
  const PI = Math.PI
  const TAU = 2 * PI
  let arc = TAU / sectors.length
  
  const friction = 0.99 // 0.995=soft, 0.99=mid, 0.98=hard
  let angVel = 0 // Angular velocity
  let ang = 0 // Angle in radians
  
  const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot
  
  function drawSector(sector, i) {
    const ang = arc * i
    ctx.save()
    // COLOR
    ctx.beginPath()
    ctx.fillStyle = sector.color
    ctx.moveTo(rad, rad)
    ctx.arc(rad, rad, rad, ang, ang + arc)
    ctx.lineTo(rad, rad)
    ctx.fill()
    // TEXT
    ctx.translate(rad, rad)
    ctx.rotate(ang + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(sector.label, rad - 10, 10)
    //
    ctx.restore()
  }
  
  function rotate() {
    if (sectors.length === 0) return;
    const sector = sectors[getIndex()]
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`
    spinEl.textContent = !angVel ? 'SPIN' : sector.label
    spinEl.style.background = sector.color
  }
  
  function frame() {
    if (!angVel) return
    angVel *= friction // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0 // Bring to stop
    ang += angVel // Update angle
    ang %= TAU // Normalize angle
    rotate()
  }
  
  function engine() {
    frame()
    requestAnimationFrame(engine)
  }

  function getRandomHalf(arr) {
    const shuffled = arr.sort(() => 0.5 - Math.random());  // Shuffle array
    const halfLength = Math.ceil(arr.length / 2);          // Calculate half length
    return shuffled.slice(0, halfLength);                  // Return half of the shuffled array
  }

  function initListSelectors() {
    document.querySelectorAll('#listSelector ul li label input')
      .forEach(input => {
        input.addEventListener('change', (event) => {
          console.log(event.target.name, event.target.checked);
          selectedLists = [];
          document.querySelectorAll('input[type="checkbox"]')
            .forEach(checkbox => {
              selectedLists = [
                ...selectedLists,
                ...checkbox.checked
                  ? getRandomHalf(listMap[checkbox.name])
                  : [],
              ];
            });

            sectors = getRandomHalf(selectedLists);
            tot = sectors.length
            arc = TAU / sectors.length
            if (sectors.length) {
              init();
            }
        });
      });
  }
  
  function init() {
    initListSelectors();
    sectors.forEach(drawSector)
    rotate() // Initial rotation
    engine() // Start engine
    spinEl.addEventListener('click', () => {
      if (!angVel) angVel = rand(0.25, 0.45)
    })
  }
  
  init()
  