'use strict';

/* ──────────────────────────────────────────────────────────────
   DATA  —  vehicles & people
   ────────────────────────────────────────────────────────────── */

const VEHICLE_CONFIG = [
    {
        id:         'sprinter',
        name:       'Mercedes Sprinter XXL',
        image:      'img/cars/sprinter.png',
        totalSeats: 8,
        drivers: [
            { name: 'Wout',  pos: { left: '28%', top: '42%' } },
            { name: 'Loris', pos: { left: '28%', top: '65%' } }
        ],
        passengerSlots: [
            { left: '40%', top: '38%' },
            { left: '40%', top: '53%' },
            { left: '40%', top: '68%' },
            { left: '53%', top: '38%' },
            { left: '53%', top: '53%' },
            { left: '53%', top: '68%' },
        ]
    },
    {
        id:         'primastar',
        name:       'Nissan Primastar',
        image:      'img/cars/primastar.png',
        totalSeats: 8,
        drivers: [
            { name: 'Jinthe', pos: { left: '39%', top: '40%' } },
            { name: 'Norah',  pos: { left: '39%', top: '69%' } }
        ],
        passengerSlots: [
            { left: '57%', top: '32%' },
            { left: '57%', top: '51%' },
            { left: '57%', top: '70%' },
            { left: '72%', top: '32%' },
            { left: '72%', top: '51%' },
            { left: '72%', top: '70%' },
        ]
    },
    {
        id:         'peugeot5008',
        name:       'Peugeot 5008',
        image:      'img/cars/5008.png',
        totalSeats: 5,
        drivers: [
            { name: 'Tuur', pos: { left: '49%', top: '35%' } },
            { name: 'Lode', pos: { left: '49%', top: '67%' } }
        ],
        passengerSlots: [
            { left: '66%', top: '33%' },
            { left: '66%', top: '51%' },
            { left: '66%', top: '68%' },
        ]
    }
];

const PASSENGERS = [
    'Zias', 'Lowie', 'Stig', 'Roeland', 'Simen',
    'Daan', 'Len', 'Matt', 'Huug', 'Lene',
    'Lien', 'Liene', 'Lies', 'Zita', 'Kaat'
];

/* ──────────────────────────────────────────────────────────────
   UTILS
   ────────────────────────────────────────────────────────────── */

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function assignPassengers() {
    const shuffled = shuffle(PASSENGERS);
    let cursor = 0;

    return VEHICLE_CONFIG.map(vehicle => {
        const count = vehicle.passengerSlots.length;

        // Shuffle the drivers internally so they randomly get assigned to either the left or right front-row seat
        const driverNames = vehicle.drivers.map(d => d.name);
        const shuffledDriverNames = shuffle(driverNames);

        const assignedDrivers = vehicle.drivers.map((posObj, index) => ({
            name: shuffledDriverNames[index],
            pos: posObj.pos
        }));

        return {
            ...vehicle,
            assignedDrivers: assignedDrivers,
            assignedPassengers: shuffled.slice(cursor, cursor += count)
        };
    });
}

/* ──────────────────────────────────────────────────────────────
   DOM BUILDERS
   ────────────────────────────────────────────────────────────── */

function createSeatEl(name, isDriver, pos) {
    const seat = document.createElement('div');
    seat.className = `seat ${isDriver ? 'seat--driver' : 'seat--passenger'}`;
    seat.style.left = pos.left;
    seat.style.top  = pos.top;
    seat.title = name;

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'seat-avatar-wrap';

    const img = document.createElement('img');
    img.className = 'seat-avatar-img';
    img.src       = 'img/persons/default.png';
    img.alt       = name;
    img.draggable = false;
    avatarWrap.appendChild(img);

    const nameTag = document.createElement('span');
    nameTag.className    = 'seat-name-tag';
    nameTag.textContent  = name;

    seat.appendChild(avatarWrap);
    seat.appendChild(nameTag);
    return seat;
}

function createVehicleCard(vehicleData) {
    const {
        id, name, image, totalSeats,
        assignedDrivers, passengerSlots, assignedPassengers
    } = vehicleData;

    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.id = id;

    const header = document.createElement('div');
    header.className = 'vehicle-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'vehicle-title-group';
    titleGroup.innerHTML = `<h2 class="vehicle-name">${name}</h2>`;

    const meta = document.createElement('div');
    meta.className = 'vehicle-meta';
    meta.innerHTML = `
        <span class="seat-pill">${totalSeats} stoelen</span>
        <span class="driver-pill">Chauffeurs: ${assignedDrivers.map(d => d.name).join(' & ')}</span>
    `;

    header.appendChild(titleGroup);
    header.appendChild(meta);

    const visual = document.createElement('div');
    visual.className = 'vehicle-visual';

    const carImg = document.createElement('img');
    carImg.className = 'car-image';
    carImg.src       = image;
    carImg.alt       = name;
    carImg.draggable = false;

    const overlay = document.createElement('div');
    overlay.className = 'seats-overlay';

    assignedDrivers.forEach(driver => {
        overlay.appendChild(createSeatEl(driver.name, true, driver.pos));
    });

    passengerSlots.forEach((pos, i) => {
        const passengerName = assignedPassengers[i] ?? '—';
        overlay.appendChild(createSeatEl(passengerName, false, pos));
    });

    visual.appendChild(carImg);
    visual.appendChild(overlay);

    card.appendChild(header);
    card.appendChild(visual);
    return card;
}

function renderAll(assignments) {
    const grid = document.getElementById('vehiclesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    assignments.forEach(v => grid.appendChild(createVehicleCard(v)));

    const passengerSeats = grid.querySelectorAll('.seat--passenger');
    passengerSeats.forEach((seat, i) => {
        seat.style.animationDelay = `${i * 38}ms`;
        seat.classList.add('seat--appear');
    });
}

function insertLegend() {
    const grid = document.getElementById('vehiclesGrid');
    if (!grid) return;

    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.setAttribute('aria-label', 'Legenda');
    legend.innerHTML = `
        <div class="legend-item">
            <span class="legend-dot legend-dot--driver"></span>
            Chauffeur
        </div>
        <div class="legend-item">
            <span class="legend-dot legend-dot--passenger"></span>
            Passagier
        </div>
    `;

    grid.insertAdjacentElement('beforebegin', legend);
}

/* ──────────────────────────────────────────────────────────────
   RANDOMISE ACTION
   ────────────────────────────────────────────────────────────── */

function randomize() {
    const btn  = document.getElementById('randomizeBtn');
    const grid = document.getElementById('vehiclesGrid');
    if (!btn || !grid) return;

    btn.disabled = true;
    btn.classList.add('btn--loading'); // Zet de animatie AAN
    grid.classList.add('is-randomizing');

    setTimeout(() => {
        const assignments = assignPassengers();
        renderAll(assignments);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                grid.classList.remove('is-randomizing');
            });
        });

        btn.disabled = false;
        btn.classList.remove('btn--loading'); // Zet de animatie UIT
    }, 340);
}

/* ──────────────────────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    insertLegend();
    renderAll(assignPassengers());

    const btn = document.getElementById('randomizeBtn');
    if (btn) btn.addEventListener('click', randomize);
});