// Shared UI pieces that mimic wms-web, wms-mobile and the Agent Shell. All return HTML strings.
(() => {
  const P = {
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="currentColor"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    fileJson: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    messagePlus: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    listChecks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="8" height="8" x="8" y="8" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    merge: '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/>',
    puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    blocks: '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>',
    brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
    play: '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5z" fill="currentColor"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
    skipBack: '<path d="M18 19.5v-15a1 1 0 0 0-1.5-.86L6.5 11.14a1 1 0 0 0 0 1.72l10 6.5A1 1 0 0 0 18 19.5z" fill="currentColor"/><path d="M5 5v14"/>',
    skipForward: '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 6 4.5z" fill="currentColor"/><path d="M19 5v14"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    branch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
    laptop: '<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/>',
    maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
    pip: '<path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"/><rect width="10" height="7" x="12" y="13" rx="2"/>',
    ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    panelLeft: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    panelLeftClose: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    goal: '<path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/>',
    calendarClock: '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
    smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    rotateCw: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  };
  const icon = (name, size = 20, color = 'currentColor', width = 2) =>
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${(P[name] || '').replaceAll('currentColor', color)}</svg>`;

  const LOGO = [
    ['var(--primary)', 'M86.7219 3.051C93.7284 -1.017 102.333 -1.017 109.34 3.051L184.691 47.3058C191.698 51.3738 196 59.0167 196 67.2143V155.786C196 164.045 191.698 171.626 184.691 175.694L109.34 219.949C102.333 224.017 93.7284 224.017 86.7219 219.949L11.3089 175.694C4.30229 171.626 0 163.983 0 155.786V67.2143C0 58.9551 4.30229 51.3738 11.3089 47.3058L86.7219 3.051Z'],
    ['#E1E2E1', 'M98.0305 112.825L122.369 98.5871C121.939 97.1694 121.078 95.9367 119.788 95.1971L100.858 84.0409C99.9973 83.5478 99.0753 83.3013 98.092 83.3013C97.1086 83.3013 96.0637 83.5478 95.1418 84.0409L76.2117 95.1971C74.9211 95.9367 73.9991 97.1694 73.6304 98.5871L97.969 112.825H98.0305Z'],
    ['#FFFFFF', 'M97.9693 112.825L73.6306 98.5874C73.4462 99.1421 73.3848 99.6352 73.3848 100.252V122.379C73.3848 124.475 74.4911 126.324 76.212 127.372L95.0806 138.466C96.0025 139.021 96.9859 139.267 98.0307 139.206V112.825H97.9693Z'],
    ['#DBDADA', 'M98.0307 112.825L122.369 98.5874C122.554 99.1421 122.615 99.6352 122.615 100.252V122.379C122.615 124.475 121.509 126.324 119.788 127.372L100.919 138.466C99.9975 139.021 99.0141 139.267 97.9692 139.206V112.825H98.0307Z'],
    ['#DBDADA', 'M98.0307 208.238C99.0141 208.238 99.9975 207.991 100.919 207.498L119.727 196.404C121.509 195.356 122.615 193.445 122.615 191.35V146.17C122.615 144.937 122.246 143.766 121.57 142.842C121.202 143.335 120.71 143.828 120.157 144.259L114.256 147.773C114.256 147.773 100.612 155.785 100.551 155.785C99.7516 156.217 98.8912 156.402 97.9692 156.402V208.238H98.0307Z'],
    ['#FFFFFF', 'M98.0308 208.238C97.0474 208.238 96.064 207.991 95.1421 207.498L76.335 196.404C74.5526 195.356 73.4463 193.445 73.4463 191.35V169.222C73.4463 169.222 73.4463 168.914 73.4463 168.791V168.359V146.17C73.4463 144.937 73.8151 143.766 74.4911 142.842C74.8599 143.335 75.3516 143.828 75.9047 144.259L81.805 147.773C81.805 147.773 95.4494 155.785 95.5109 155.785C96.3099 156.217 97.1703 156.402 98.0923 156.402V208.238H98.0308Z'],
  ];
  const logo = (height = 24) =>
    `<svg class="icon" height="${height}" width="${(height * 196) / 223}" viewBox="0 0 196 223">${LOGO.map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join('')}</svg>`;

  const webTopbar = (user = 'Emily Carter', initials = 'EC') => `
    <div class="topbar">
      ${icon('menu', 18, '#525252')}
      <div class="brand">${logo(24)} Item WMS</div>
      <div class="facility">${icon('building', 16)} Valley View (10) ${icon('chevronDown', 14)}</div>
      <div class="search">${icon('search', 16)} Quick Search</div>
      <div class="user">${icon('bell', 18, '#525252')}<span style="width:14px"></span>${icon('moon', 18, '#525252')}<span style="width:8px"></span><div class="avatar">${initials}</div>${user}</div>
    </div>`;

  // Android 3-button navigation bar of the T1Pro: recents, home, back. `scale` shrinks it for the mini phones.
  const navBar = (scale = 1) => {
    const g = (w, body) => `<svg width="${w * scale}" height="${w * scale}" viewBox="0 0 24 24" fill="#5f6368">${body}</svg>`;
    return `<div class="navbar"${scale === 1 ? '' : ` style="height:${52 * scale}px;padding:0 ${76 * scale}px"`}>
      ${g(22, '<rect x="3" y="3" width="18" height="18" rx="2.5"/>')}${g(24, '<circle cx="12" cy="12" r="10"/>')}${g(22, '<path d="M19 3.5v17a1 1 0 0 1-1.5.87L4 13a1.15 1.15 0 0 1 0-2l13.5-8.37A1 1 0 0 1 19 3.5z"/>')}
    </div>`;
  };

  const phoneShell = (inner) => `<div class="screen"><div class="app">${inner}</div>${navBar()}</div>`;

  const mHeader = (title, sub, { back = true, acts = ['sparkles', 'more'] } = {}) => `
    <div class="m-header">
      ${back ? icon('arrowLeft', 26, '#fff') : icon('menu', 26, '#fff')}
      <div><div class="t">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>
      <div class="acts">${acts.map((a) => icon(a, 24, '#fff')).join('')}</div>
    </div>`;

  const askBar = () => `<div class="m-ask">${icon('sparkles', 22, 'var(--primary)')} Ask Item WMS Agent ${icon('chevronDown', 16)}<span style="margin-left:auto">${icon('mic', 22, '#525252')}</span></div>`;


  // Mobile Agent panel pieces (wms-mobile src/agent). `body` goes into .ma-msgs, which scenes scroll by moving it.
  const agentPage = (subtitle, body) => `
    <div class="ma">
      <div class="ma-head">${icon('sparkles', 28, 'var(--primary)')}<div class="tt"><div class="t">WMS Agent</div><div class="s">${subtitle}</div></div>
        <span class="acts">${icon('messagePlus', 25, 'var(--text)')}${icon('history', 25, 'var(--text)')}${icon('x', 26, 'var(--text)')}</span></div>
      <div class="ma-list"><div class="ma-msgs">${body}</div></div>
      <div class="ma-composer"><div class="box"><div class="ma-fill"></div><div class="ma-typed"></div><div class="ph">Message, or hold to talk</div>
        <div class="row">${icon('eye', 23, '#3f3f46')}${icon('camera', 23, '#3f3f46')}<span style="margin-left:auto">${icon('mic', 23, '#3f3f46')}</span><span class="send">${icon('send', 20, '#fff')}</span></div></div></div>
      <div class="ma-glow"><div class="mg-tr"></div><div class="mg-hint">Release to insert · Slide up to cancel</div>
        <svg class="mg-wave" width="285" height="44" viewBox="0 0 285 44"><path stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg></div>
    </div>`;
  const maTool = (iconName, label, chevron = false) => `<div class="ma-tool">${icon(iconName, 16, 'var(--muted)')}<span>${label}</span>${chevron ? icon('chevronRight', 16, 'var(--muted)') : ''}</div>`;
  const maWorked = (duration) => `<div class="ma-worked">${icon('clock', 17, 'var(--muted)')}Worked for ${duration}</div>`;
  const STATUS_TONE = { success: ['var(--success-bg)', 'var(--success)'], warning: ['var(--warning-bg)', 'var(--warning)'], primary: ['var(--primary-soft)', 'var(--primary)'] };
  // GenUiCard: header (title, subtitle, status badge), body, then stacked 44dp buttons (the first one solid).
  const maCard = ({ title, subtitle = '', badge = null, fields = null, body = '', actions = [] }) => `
    <div class="ma-card">
      <div class="ch"><div><div class="ct">${title}</div>${subtitle ? `<div class="cs">${subtitle}</div>` : ''}</div>${badge ? `<span class="cbadge" style="background:${STATUS_TONE[badge[1]][0]};color:${STATUS_TONE[badge[1]][1]}">${badge[0]}</span>` : ''}</div>
      ${fields ? `<div class="cb">${fields.map(([label, value]) => `<div><div class="cl">${label}</div><div class="cv">${value}</div></div>`).join('')}</div>` : body}
      ${actions.length ? `<div class="cf">${actions.map((label, i) => `<div class="cbtn${i === 0 ? ' solid' : ''}">${label}</div>`).join('')}</div>` : ''}
    </div>`;

  // Agent panel docked beside the Workspace Browser (agent-workspace-ui AgentChatPanel in split view): conversation
  // title + connection dot + split toolbar, the message list, and the composer. The composer dictates while the mic
  // (or right Ctrl) is held: .wa-status says Listening/Transcribing, .wa-fill sweeps while the words become text.
  const webAgentPanel = ({ title = 'New conversation', body = '' }) => `
    <div class="wa">
      <div class="wa-head">${agentMark(20)}<span class="wa-title">${title}</span><span class="wa-dot"></span>
        <span class="wa-acts"><span class="wa-app"><span>${icon('laptop', 18, 'var(--strong)')}${icon('chevronDown', 13, '#707070')}</span></span>${['maximize', 'pip', 'ellipsis'].map((name) => `<span class="wa-act">${icon(name, 19, '#525252')}</span>`).join('')}</span></div>
      <div class="wa-list"><div class="wa-msgs">${body}</div></div>
      <div class="wa-composer"><div class="box"><div class="wa-fill"></div>
        <div class="wa-status"><span class="badge"><span class="ping"></span>${icon('mic', 12, '#fff')}</span><span class="st">Listening… Release right Ctrl to insert</span></div>
        <div class="wa-input"><span class="ph">Send to Item WMS Agent… hold right Ctrl or the mic to talk</span><span class="wa-typed"></span></div>
        <div class="row">${['paperclip', 'eye', 'camera'].map((name) => `<span class="wa-act">${icon(name, 19, '#707070')}</span>`).join('')}
          <span class="model">deepseek-flash ${icon('chevronDown', 15, '#707070')}</span>
          <span class="mic">${icon('mic', 19, '#525252')}</span><span class="send">${icon('send', 17, '#fff')}</span></div>
      </div></div>
    </div>`;
  // Tool call as AgentMessageItem's ghost row: tool icon and label in muted text, no fill.
  const waTool = (iconName, label, detail = '') => `<div class="wa-tool">${icon(iconName, 17, 'var(--muted)')}<span>${label}</span>${detail ? `<span class="d">${detail}</span>` : ''}</div>`;

  // Mobile app as the Workspace Browser embeds it (agent-workspace-web App.tsx): the Expo web app in a device frame
  // with a 12px black border, centred on the pane. It is a browser iframe, so there is no Android navigation bar.
  const wsDevice = (inner) => `<div class="wsd"><div class="wsd-screen">${inner}</div></div>`;
  // present_card as the web GenUiCard renders it: header (title, subtitle, status), label/value blocks, footer buttons
  // (the first solid) with the request result line below them.
  const waCard = ({ title, subtitle = '', badge = null, rows = [], actions = [] }) => `
    <div class="wac">
      <div class="wac-h"><div style="min-width:0;flex:1"><div class="t">${title}</div>${subtitle ? `<div class="s">${subtitle}</div>` : ''}</div>${badge ? `<span class="pill ${badge[1]} wac-badge">${badge[0]}</span>` : ''}</div>
      <div class="wac-b">${rows.map(([cls, label, value, sub = '']) => `<div class="wac-r ${cls}"><div class="l">${label}</div><div class="v">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`).join('')}</div>
      <div class="wac-f"><div class="btns">${actions.map(([cls, label], i) => `<span class="wac-btn ${i === 0 ? 'solid' : ''} ${cls}">${label}</span>`).join('')}</div><div class="wac-run"></div></div>
    </div>`;

  // Agent mark as wms-mobile's StarMarkIcon: one star outline drawn twice, solid big star and an outline small star
  // at 0.3x around (20,5). `stroke` is in viewBox units: the app's 2 suits ~20px icons; large marks need a thinner one.
  const STAR_PATH = 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z';
  const agentMark = (size, color = 'var(--primary)', stroke = 2) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${STAR_PATH}" fill="${color}" stroke-width="${stroke}"/>
      <g transform="translate(20 5) scale(0.3) translate(-12 -12)" stroke-width="${stroke / 0.3}"><path d="${STAR_PATH}"/></g>
    </svg>`;

  const chapter = (eyebrow, headline, subline = '') => `
    <div class="chapter"><div class="eyebrow">${eyebrow}</div><div class="headline">${headline}</div>${subline ? `<div class="subline">${subline}</div>` : ''}</div>`;

  const damagedBoxSvg = (w = 120) => `
    <svg width="${w}" height="${w * 0.8}" viewBox="0 0 150 120">
      <rect width="150" height="120" fill="#6b5b4a"/>
      <rect y="78" width="150" height="42" fill="#4d4034"/>
      <path d="M22 40 L82 26 L128 40 L128 98 L68 112 L22 98 Z" fill="#c9965b"/>
      <path d="M22 40 L68 52 L68 112 L22 98 Z" fill="#b5834c"/>
      <path d="M68 52 L128 40 L128 98 L68 112 Z" fill="#d6a66a"/>
      <path d="M22 40 L82 26 L128 40 L68 52 Z" fill="#e2b77e"/>
      <path d="M96 44 L110 62 L102 70 L118 84 L108 96 L92 80 L98 64 Z" fill="#7a5530" opacity=".85"/>
      <path d="M96 44 L110 62 L102 70 L118 84" stroke="#3d2a14" stroke-width="2" fill="none"/>
      <rect x="80" y="70" width="30" height="12" fill="#fff" opacity=".8" transform="skewY(-11)"/>
      <path d="M30 60 L58 68" stroke="#8a6232" stroke-width="3"/>
    </svg>`;

  // Save as Task Type: the plan's declared fields become inputs for each new task (toggle rows with the source value).
  const saveTypeSheet = ({ cls = '', name = '', nameCls = '', saveCls = '' }) => `
    <div class="st-sheet ${cls}">
      <div class="st-handle"></div>
      <div class="st-title">Save as Task Type</div>
      <div class="st-sub">Reuse this plan without an Agent conversation.</div>
      <div class="m-label st-gap">Task Type Name</div><div class="m-scan st-name"><span class="v ${nameCls}">${name}</span></div>
      <div class="m-label st-gap">Inputs for Each New Task</div>
      <div class="st-row"><div><div class="st-rt">Customer</div><div class="st-rc">Default: Northbridge Service Parts</div></div><span class="st-toggle"></span></div>
      <div class="st-btns"><div class="m-btn ghost">Cancel</div><div class="m-btn ${saveCls}">Save</div></div>
    </div>`;

  // Move Inventory (composable step) on mobile, composed like the Inventory Patrol page: an Info region (what to move,
  // the place as a solid location badge) over a Work region in phases. Take: ① scan the From location, ② scan the
  // item, ③ confirm Qty · UOM and scan the To LPN. Place: ① scan the held LPN, ② scan the destination.
  // Class hooks: .mt-* (take) and .mp-* (place); phases .ph1-3 dim until reached (.on).
  const scanBox = (cls, prompt) => `<div class="m-scan ${cls}"><span class="v"></span><span class="ck">${icon('check', 18, 'var(--success)', 2.5)}</span><span class="pp">${prompt}</span><span class="ico">${icon('scan', 18)}</span></div>`;
  const mvInfo = (label, value, metas, anchorLabel, anchor, extra = '') => `
    <div class="mv-info"><div class="mv-row">
      <div class="mv-lead"><div class="mv-l">${label}</div><div class="mv-v">${value}</div>${metas.map((m) => `<div class="mv-meta">${m}</div>`).join('')}</div>
      <div class="mv-anchor"><div class="mv-l">${anchorLabel}</div><span class="mv-badge">${anchor}</span></div>
    </div>${extra}</div>`;
  const phaseHead = (n, title) => `<div class="mv-ph"><span class="n">${n}</span>${title}</div>`;
  const moveTakeScreen = ({ title, sub, step, item, itemName, qty, uom, fromLpn, location, next }) => `
    ${mHeader(title, sub)}
    <div class="m-body m-page" style="bottom:78px">
      ${mvInfo(`Take · ${step}`, item, [itemName, `${qty} ${uom} · Damaged · ${fromLpn}`], 'From', location,
        next ? `<div class="mv-next">Next · ${next}</div>` : '')}
      <div class="m-work mv-work">
        <div class="mv-phase ph1 on">${phaseHead(1, 'Scan Location')}${scanBox('mt-loc', `Scan ${location}`)}<div class="m-err mt-lerr">Wrong location · go to ${location}</div></div>
        <div class="mv-phase ph2">${phaseHead(2, 'Scan Item')}${scanBox('mt-item', `Scan ${item}`)}<div class="m-hint mt-ihint">${fromLpn} · ${qty} ${uom} · Damaged</div></div>
        <div class="mv-phase ph3">${phaseHead(3, 'Qty · To LPN')}
          <div class="m-qtyu"><div class="ql"><div class="m-label">Qty</div><div class="row"><span class="btn">−</span><span class="val mt-qty">0</span><span class="btn">+</span></div></div><div class="qr"><div class="m-label">UOM</div><div class="uomv">${uom}</div></div></div>
          ${scanBox('mt-to', 'Scan To LPN')}
        </div>
      </div>
    </div>
    <div class="m-footer"><div class="m-btn mt-btn">Confirm Take</div></div>`;
  const movePlaceScreen = ({ title, sub, step, toLpn, item, qty, uom, suggestion }) => `
    ${mHeader(title, sub)}
    <div class="m-body m-page" style="bottom:78px">
      ${mvInfo(`Place · ${step}`, toLpn, [`In hand · ${item} · ${qty} ${uom} · Damaged`], 'Suggested', suggestion)}
      <div class="m-work mv-work">
        <div class="mv-phase ph1 on">${phaseHead(1, 'Scan Held LPN')}${scanBox('mp-held', `Scan ${toLpn}`)}</div>
        <div class="mv-phase ph2">${phaseHead(2, 'Scan Destination')}${scanBox('mp-dest', `Scan ${suggestion}`)}</div>
      </div>
    </div>
    <div class="m-footer"><div class="m-btn mp-btn">Confirm Place</div></div>`;

  // Old vs new for the three case apps (patrol report, dispatch page, Move Damage). The old side is an estimate for a
  // typical 3PL customization request; the new side is this case. s01-compare and s18-close both read it, and the
  // narration says the same numbers, so change them together.
  const COMPARE = {
    before: {
      effort: 5, effortHours: 40, effortDetail: '需求 1 · 开发 2 · 测试 1 · 实施上线 1',
      lead: '≈ 2', leadUnit: '周', leadDays: 14, leadDetail: '一个 Scrum 迭代：排期 · 开发 · 测试 · 上线',
      outcome: ['需求经 5 次转述，背景和优先级层层损耗', '上线之前，现场看不到成品', '改一处要排进下个迭代，再等 2 周'],
    },
    after: {
      effortPer: '每个应用', effort: '< 1', effortUnit: '小时', effortHours: 3, effortDetail: '每个应用一次对话 · 当场试运行 · 审核发布',
      lead: '当天上线', leadDays: 1, leadDetail: 'Agent 几分钟出初版，人确认后发布',
      outcome: ['需求方亲自说明，一手语境不丢', '初版当场生成，现场直接试用', '哪里不对说一句，几分钟生效'],
    },
  };

  window.UI = { COMPARE, moveTakeScreen, movePlaceScreen, webAgentPanel, waTool, wsDevice, waCard, saveTypeSheet, icon, logo, agentMark, webTopbar, navBar, phoneShell, agentPage, maTool, maWorked, maCard, mHeader, askBar, chapter, damagedBoxSvg };
})();
