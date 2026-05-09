'use strict';

const SHOW_AVATARS = false;

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

        // Shuffle drivers within their vehicle so either name can be in the driver seat
        const driverNames = vehicle.drivers.map(d => d.name);
        const shuffledDriverNames = shuffle(driverNames);

        const assignedDrivers = vehicle.drivers.map((posObj, index) => ({
            name: shuffledDriverNames[index],
            pos: posObj.pos
        }));

        return {
            ...vehicle,
            assignedDrivers,
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

    // Voeg een modifier class toe als we GEEN avatars gebruiken
    if (!SHOW_AVATARS) {
        seat.classList.add('seat--text-only');
    }

    // Bouw de avatar alleen op als SHOW_AVATARS true is
    if (SHOW_AVATARS) {
        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'seat-avatar-wrap';

        const img = document.createElement('img');
        img.className = 'seat-avatar-img';
        img.src       = 'img/persons/default.png';
        img.alt       = name;
        img.draggable = false;
        avatarWrap.appendChild(img);
        seat.appendChild(avatarWrap);
    }

    const nameTag = document.createElement('span');
    nameTag.className   = 'seat-name-tag';
    nameTag.textContent = name;
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
   URL STATE MANAGEMENT (Save & Load van URL)
   ────────────────────────────────────────────────────────────── */

// Zet de assignments om naar een veilige string voor in de URL
function saveToUrl(assignments) {
    const jsonStr = JSON.stringify(assignments);
    const base64 = btoa(encodeURIComponent(jsonStr)); // Codeer naar base64
    window.location.hash = `indeling=${base64}`;      // Plak het achter de # in de url
}

// Lees de URL uit en kijk of er een opgeslagen indeling in zit
function loadFromUrl() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#indeling=')) {
        try {
            const base64 = hash.replace('#indeling=', '');
            const jsonStr = decodeURIComponent(atob(base64));
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Kon de gedeelde link niet lezen", e);
            return null; // Als de link stuk is, return niks
        }
    }
    return null;
}

/* ──────────────────────────────────────────────────────────────
   RANDOMISE ACTION
   ────────────────────────────────────────────────────────────── */

function randomize() {
    const btn  = document.getElementById('randomizeBtn');
    const grid = document.getElementById('vehiclesGrid');
    if (!btn || !grid) return;

    btn.disabled = true;
    btn.classList.add('btn--loading');
    grid.classList.add('is-randomizing');

    setTimeout(() => {
        const assignments = assignPassengers();

        // SLA OP IN URL
        saveToUrl(assignments);

        renderAll(assignments);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                grid.classList.remove('is-randomizing');
            });
        });

        btn.disabled = false;
        btn.classList.remove('btn--loading');
    }, 340);
}

/* ──────────────────────────────────────────────────────────────
   SHARE ACTION (Link Delen ipv Afbeelding)
   ────────────────────────────────────────────────────────────── */

function canNativeShare() {
    return !!navigator.share; // Simpele check of de browser een deelfunctie heeft
}

function showToast(message, duration = 2600) {
    const toast = document.getElementById('shareToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, duration);
}

async function shareSeating() {
    const btn       = document.getElementById('shareBtn');
    if (!btn) return;

    // De URL pakken (inclusief de #indeling code)
    const shareUrl = window.location.href;

    try {
        if (canNativeShare()) {
            /* ── Mobile: native share sheet (Opent Whatsapp direct) ── */
            await navigator.share({
                title: 'JinKamp Indeling 2026',
                text: 'Hier is de indeling voor de auto\'s!',
                url: shareUrl,
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            showToast('Link gekopieerd! Plak hem in Whatsapp/Messenger.');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('[JinKamp] Share failed:', err);
            // Fallback als het faalt
            await navigator.clipboard.writeText(shareUrl);
            showToast('Link gekopieerd!');
        }
    }
}

/* ──────────────────────────────────────────────────────────────
   INIT & PRELOADER
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    insertLegend();

    const grid = document.getElementById('vehiclesGrid');
    const imagesToPreload = VEHICLE_CONFIG.map(v => v.image);
    if (SHOW_AVATARS) {
        imagesToPreload.push('img/persons/default.png');
    }

    let loadedCount = 0;

    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;

        img.onload = img.onerror = () => {
            loadedCount++;

            if (loadedCount === imagesToPreload.length) {

                // 1. Kijk of er een indeling in de link staat
                const savedAssignments = loadFromUrl();

                if (savedAssignments) {
                    // Er is een gedeelde link geopend: toon deze
                    renderAll(savedAssignments);
                } else {
                    // GEEN indeling in link: voer een automatische randomisatie uit
                    const initialAssignments = assignPassengers();
                    renderAll(initialAssignments);
                    saveToUrl(initialAssignments); // DIT zorgt dat de URL direct gevuld wordt!
                }

                // Maak de grid zichtbaar
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        grid.classList.remove('is-randomizing');
                    });
                });
            }
        };
    });

    // Koppel de knoppen
    const randomizeBtn = document.getElementById('randomizeBtn');
    if (randomizeBtn) randomizeBtn.addEventListener('click', randomize);

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.classList.add(canNativeShare() ? 'share-btn--native' : 'share-btn--clipboard');
        shareBtn.addEventListener('click', shareSeating);
    }
});