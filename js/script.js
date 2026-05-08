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

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'seat-avatar-wrap';

    const img = document.createElement('img');
    img.className = 'seat-avatar-img';
    img.src       = 'img/persons/default.png';
    img.alt       = name;
    img.draggable = false;
    avatarWrap.appendChild(img);

    const nameTag = document.createElement('span');
    nameTag.className   = 'seat-name-tag';
    nameTag.textContent = name;

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
    btn.classList.add('btn--loading');
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
        btn.classList.remove('btn--loading');
    }, 340);
}

/* ──────────────────────────────────────────────────────────────
   SHARE ACTION
   ────────────────────────────────────────────────────────────── */

/**
 * Detect whether the native Web Share API supports sharing files.
 * True on iOS Safari and Android Chrome; false on most desktops.
 */
function canNativeShare() {
    try {
        const probe = new File([''], 'probe.png', { type: 'image/png' });
        return !!navigator.canShare && navigator.canShare({ files: [probe] });
    } catch {
        return false;
    }
}

/**
 * Show a brief toast message below the share button.
 * @param {string} message
 * @param {number} [duration=2600]  — ms before toast fades out
 */
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

/**
 * Use html2canvas to render the full seating grid to a Blob.
 * html2canvas walks the live DOM, so all overlaid name-tags are captured.
 *
 * We temporarily force every passenger seat to full opacity so the
 * CSS `opacity: 0` initial state (used for the entrance animation)
 * doesn't make seats invisible in the screenshot.
 *
 * @returns {Promise<Blob>}
 */
async function captureGridAsBlob() {
    const grid = document.getElementById('vehiclesGrid');

    // 1. Selecteer álle stoelen (zowel chauffeurs als passagiers)
    const allSeats = grid.querySelectorAll('.seat');

    // 2. Zet animaties tijdelijk uit en forceer volledige zichtbaarheid.
    // Omdat de CSS '.seat' class al 'transform: translate(-50%, -50%)' heeft,
    // snappen ze door 'animation: none' perfect naar hun eindpositie.
    allSeats.forEach(s => {
        s.style.animation = 'none';
        s.style.opacity = '1';
    });

    // 3. Wacht een fractie van een seconde (150ms) zodat de browser deze nieuwe,
    // stilstaande frames daadwerkelijk op het scherm tekent voordat de foto wordt genomen.
    await new Promise(resolve => setTimeout(resolve, 150));

    let blob;
    try {
        const canvas = await html2canvas(grid, {
            backgroundColor: '#f4f7f9',   // matches --bg
            scale: 2,                      // 2× for crisp retina output
            useCORS: true,                 // needed when images are local files served via a server
            allowTaint: true,              // fallback for file:// protocol
            logging: false,
        });

        blob = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/png')
        );
    } finally {
        // 4. Herstel de originele styling (verwijdert de inline styles) zodat
        // de css-animaties bij een volgende klik op 'Randomize' gewoon weer werken.
        allSeats.forEach(s => {
            s.style.animation = '';
            s.style.opacity = '';
        });
    }

    return blob;
}

/**
 * Main share handler:
 *   1. Capture the seating grid as a PNG blob via html2canvas
 *   2a. Mobile  → navigator.share() with the file (shows WhatsApp, etc.)
 *   2b. Desktop → navigator.clipboard.write() copies PNG to clipboard
 *   2c. Fallback → trigger a file download
 */
async function shareSeating() {
    const btn       = document.getElementById('shareBtn');
    const labelEl   = document.getElementById('shareBtnLabel');
    if (!btn) return;

    // Show loading state
    btn.disabled = true;
    btn.classList.add('btn--loading');
    if (labelEl) labelEl.textContent = 'Bezig…';

    try {
        const blob = await captureGridAsBlob();
        const file = new File([blob], 'jinkamp-indeling.png', { type: 'image/png' });

        if (canNativeShare()) {
            /* ── Mobile: native share sheet ───────────────────── */
            await navigator.share({
                files: [file],
                title: 'JinKamp Indeling',
                text: 'Bekijk de zitplaatsen voor JinKamp 2026!',
            });
            // No toast needed — the OS share sheet is the feedback
        } else if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
            /* ── Desktop: copy PNG to clipboard ──────────────── */
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('Afbeelding gekopieerd naar klembord!');
        } else {
            /* ── Last resort: download the image ─────────────── */
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href     = url;
            anchor.download = 'jinkamp-indeling.png';
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
            showToast('Afbeelding gedownload!');
        }
    } catch (err) {
        // User cancelled native share — not an error worth surfacing
        if (err.name !== 'AbortError') {
            console.error('[JinKamp] Share failed:', err);
            showToast('Oeps, er ging iets mis. Probeer opnieuw.');
        }
    } finally {
        btn.disabled = false;
        btn.classList.remove('btn--loading');
        if (labelEl) labelEl.textContent = 'Deel indeling';
    }
}

/* ──────────────────────────────────────────────────────────────
   INIT & PRELOADER
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    insertLegend();

    const grid = document.getElementById('vehiclesGrid');

    // 1. Verzamel alle afbeeldingen die we willen inladen
    const imagesToPreload = VEHICLE_CONFIG.map(v => v.image);
    imagesToPreload.push('img/persons/default.png'); // Voeg ook de avatar toe

    let loadedCount = 0;

    // 2. Laad ze één voor één in het geheugen
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;

        // Zodra een afbeelding geladen is (of faalt), tel er eentje op
        img.onload = img.onerror = () => {
            loadedCount++;

            // Als alle afbeeldingen binnen zijn...
            if (loadedCount === imagesToPreload.length) {
                // ...bouw dan de indeling
                renderAll(assignPassengers());

                // ...en verwijder de verberg-klasse zodat alles mooi in-fadet
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        grid.classList.remove('is-randomizing');
                    });
                });
            }
        };
    });

    // 3. Koppel de knoppen
    const randomizeBtn = document.getElementById('randomizeBtn');
    if (randomizeBtn) randomizeBtn.addEventListener('click', randomize);

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.classList.add(canNativeShare() ? 'share-btn--native' : 'share-btn--clipboard');
        shareBtn.addEventListener('click', shareSeating);
    }
});