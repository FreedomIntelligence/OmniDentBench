(() => {
  const tooth = '<path d="M12 8c-4-3-8-1-8 4 0 4 2 6 3 10s2 4 3 0l2-5 2 5c1 4 2 4 3 0s3-6 3-10c0-5-4-7-8-4Z"/>';
  const icons = {
    'Endodontics': tooth + '<path d="M10 9c3 2 5 0 6 0M12 11v5m0-3-3 4m3-4 3 4"/>',
    'Oral and Maxillofacial Pathology': '<path d="m11 5 5 3-5 8-5-3Zm1-2 6 4M8 15l-2 3m8-5a6 6 0 0 1 1 12H5m9-8H7m-2 4h5m-6 4v2h16"/><circle cx="17" cy="13" r="2"/>',
    'Orthodontics and Dentofacial Orthopedics': '<path d="M4 9c4-4 16-4 20 0v11c-4 4-16 4-20 0Zm0 6h20M9 8v14m10-14v14"/><rect x="7" y="12" width="4" height="6" rx="1"/><rect x="17" y="12" width="4" height="6" rx="1"/>',
    'Oral and Maxillofacial Surgery': '<path d="m17 5 6 6-9 9-5-5Zm-8 10-4 4c-2 2-2 5-2 6 1 0 4 0 6-2l5-5M17 5l3-3 6 6-3 3M14 10l6 6"/>',
    'Pediatric Dentistry': '<path d="M10 12c-4-2-7 0-6 4l2 7c1 4 3 1 4-3 1 4 3 7 4 3l2-7c1-4-2-6-6-4Z"/><circle cx="21" cy="7" r="3"/><path d="M17 17v-1a4 4 0 0 1 8 0v3m-2-2v7M19 3l2-1 2 1"/>',
    'Dental Public Health': '<circle cx="14" cy="7" r="3"/><circle cx="5" cy="11" r="2.5"/><circle cx="23" cy="11" r="2.5"/><path d="M8 25v-7a6 6 0 0 1 12 0v7M2 23v-5a3 3 0 0 1 6 0m12 0a3 3 0 0 1 6 0v5m-12-6v5m-2.5-2.5h5"/>',
    'Prosthodontics': '<path d="M5 15 3 7l7 4 4-7 4 7 7-4-2 8Zm0 0v5h18v-5M8 20v3c0 3 3 3 4 0l2-2 2 2c1 3 4 3 4 0v-3"/>',
    'Oral and Maxillofacial Radiology': '<rect x="4" y="3" width="20" height="23" rx="2"/><path d="M10 9c-3-2-4 0-3 3l2 7c1 3 3-1 5-3 2 2 4 6 5 3l2-7c1-3-1-5-4-3-2 1-5 1-7 0Zm4 2v5M7 23h14"/>',
    'Periodontics': tooth + '<path d="M2 17c3 0 3-3 6-3s3 2 4 2 2-2 4-2 3 3 6 3m-20 5c2 1 3 1 5 0m10 0c2 1 3 1 5 0"/>',
    'Orofacial Pain': '<path d="M16 25v-5c5-1 6-5 5-10a8 8 0 0 0-16 0l-2 5h3v4c0 1 2 2 5 2v4m13-20 2-2m-1 8h3m-5 5 3 2"/><path d="m13 7-3 6h5l-3 5"/>',
    'Oral Medicine': '<path d="M5 4H3v7a6 6 0 0 0 12 0V4h-2M9 17v3a5 5 0 0 0 10 0v-2"/><path d="M6 3v4m6-4v4"/><circle cx="20" cy="13" r="4"/><path d="M20 11v4m-2-2h4"/>',
    'Dental Anesthesiology': '<path d="m20 3 6 6m-3-3-4 4m-6-4 9 9M14 7l-9 9 7 7 9-9M5 16l-2 8 9-1M3 24l-2 3m9-16 3 3m-6 0 3 3m-6 0 3 3"/>'
  };
  window.ODBSpecialtyIcon = name => `<span class="specialty-icon"><svg viewBox="0 0 28 30" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || tooth}</svg></span>`;
})();
