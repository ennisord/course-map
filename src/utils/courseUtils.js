export function getColor(tags) {
  if (tags.includes('honours')) return { border: '#b8860b', text: '#ffd700', muted: '#8a6500' }
  if (tags.includes('core')) return { border: '#1a5c2e', text: '#4ade80', muted: '#166634' }
  return { border: '#2e2e2e', text: '#e5e5e5', muted: '#555' }
}

export function getGlow(tags) {
  if (tags.includes('honours')) return '0 0 10px 2px rgba(184,134,11,0.7)'
  if (tags.includes('core')) return '0 0 10px 2px rgba(74,222,128,0.7)'
  return '0 0 10px 2px rgba(150,150,150,0.5)'
}

export function resolvePrereq(prereq, courseList) {
  if (typeof prereq === 'number') {
    const match = courseList.find(c => c.id === prereq)
    return match ? `${match.dept}-${match.id}` : null
  }
  const parts = prereq.trim().split(/\s+/)
  if (parts.length < 2) return null
  const dept = parts[0]
  const id = parseInt(parts[1])
  const match = courseList.find(c => c.dept === dept && c.id === id)
  return match ? `${match.dept}-${match.id}` : null
}

export function getBezier(x1, y1, x2, y2) {
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}

// Returns { layout, collapsedElectives, zoneExtents }
// layout: { [key]: { x, y } } — only core/honours courses + one ghost node per zone that has electives
// collapsedElectives: { [zoneGhostKey]: { courses: [...], x, y } }
// zoneExtents: { [zone]: { startX, endX } } — pixel bounds of each zone column
export function buildLayout(courses) {
  const ZONE_GAP = 400
  const SUBCOL_GAP = 250
  const ROW_GAP = 140
  const NODE_WIDTH = 176

  // Separate visible (core/honours) from electives (tags: [])
  const isElective = c => c.tags.length === 0
  const visibleCourses = courses.filter(c => !isElective(c))
  const electiveCourses = courses.filter(isElective)

  const byZone = {}
  visibleCourses.forEach(c => {
    const zone = Math.floor(c.id / 100)
    if (!byZone[zone]) byZone[zone] = []
    byZone[zone].push(c)
  })

  // Also track which zones have electives
  const electivesByZone = {}
  electiveCourses.forEach(c => {
    const zone = Math.floor(c.id / 100)
    if (!electivesByZone[zone]) electivesByZone[zone] = []
    electivesByZone[zone].push(c)
  })

  // Make sure zones with electives but no visible courses still get a zone entry
  Object.keys(electivesByZone).forEach(zone => {
    if (!byZone[zone]) byZone[zone] = []
  })

  const positioned = {}
  const sortedZones = Object.keys(byZone).map(Number).sort()
  const allGroupSizes = sortedZones.map(z => byZone[z].length + (electivesByZone[z] ? 1 : 0))
  const globalMax = Math.max(...allGroupSizes, 1)
  const globalHeight = (globalMax - 1) * ROW_GAP
  let zoneX = 0

  const collapsedElectives = {}
  const zoneExtents = {}

  sortedZones.forEach(zone => {
    const group = byZone[zone]
    const idSet = new Set(group.map(c => c.id))

    const subcol = {}
    const getSubcol = (course) => {
      if (subcol[course.id] !== undefined) return subcol[course.id]

      const inZonePrereqs = course.prereqs.filter(p => {
        if (typeof p === 'number') return idSet.has(p)
        const parts = p.trim().split(/\s+/)
        if (parts.length < 2) return false
        const pid = parseInt(parts[1])
        return idSet.has(pid)
      }).map(p => {
        if (typeof p === 'number') return p
        return parseInt(p.trim().split(/\s+/)[1])
      })

      if (inZonePrereqs.length === 0) { subcol[course.id] = 0; return 0 }
      const max = Math.max(...inZonePrereqs.map(pid => {
        const prereq = group.find(c => c.id === pid)
        return prereq ? getSubcol(prereq) : 0
      }))
      subcol[course.id] = max + 1
      return max + 1
    }

    group.forEach(c => getSubcol(c))

    const bySubcol = {}
    group.forEach(c => {
      const sc = subcol[c.id]
      if (!bySubcol[sc]) bySubcol[sc] = []
      bySubcol[sc].push(c)
    })

    Object.entries(bySubcol).forEach(([sc, subgroup]) => {
      const startY = 50
      subgroup.forEach((c, i) => {
        positioned[`${c.dept}-${c.id}`] = {
          x: zoneX + parseInt(sc) * SUBCOL_GAP,
          y: startY + i * ROW_GAP,
        }
      })
    })

    // Place ghost node for electives in this zone
    if (electivesByZone[zone]) {
      const col0Courses = bySubcol[0] || []
      const col0Ys = col0Courses.map(c => positioned[`${c.dept}-${c.id}`]?.y ?? 0)
      const bottomY = col0Ys.length > 0 ? Math.max(...col0Ys) + ROW_GAP : 40
      const ghostX = zoneX
      const ghostKey = `ghost-${zone}`
      positioned[ghostKey] = { x: ghostX, y: bottomY }
      collapsedElectives[ghostKey] = {
        courses: electivesByZone[zone],
        x: ghostX,
        y: bottomY,
      }
    }

    const maxSubcol = bySubcol && Object.keys(bySubcol).length > 0
      ? Math.max(...Object.keys(bySubcol).map(Number))
      : 0

    // Record zone extents: startX is the left edge, endX is right edge of last subcol + node width
    zoneExtents[zone] = {
      startX: zoneX - NODE_WIDTH / 2,
      endX: zoneX + maxSubcol * SUBCOL_GAP + NODE_WIDTH / 2,
    }

    zoneX += ZONE_GAP + maxSubcol * SUBCOL_GAP
  })

  return { layout: positioned, collapsedElectives, zoneExtents }
}

// Call once after buildLayout to register content bounds for clamping.
let _contentBounds = null
export function setContentBounds(bounds) {
  _contentBounds = bounds
}

export function clampOffset(x, y, scale) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const MARGIN = 120

  if (_contentBounds) {
    const cLeft   = _contentBounds.minX * scale
    const cRight  = _contentBounds.maxX * scale
    const cTop    = _contentBounds.minY * scale
    const cBottom = _contentBounds.maxY * scale

    const minX = MARGIN - cRight
    const maxX = vw - MARGIN - cLeft
    const minY = MARGIN - cBottom
    const maxY = vh - MARGIN - cTop

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    }
  }

  const pad = 0.85
  return {
    x: Math.min(vw * 2, Math.max(-4000 * scale + vw * pad, x)),
    y: Math.min(vh * 2, Math.max(-4000 * scale + vh * pad, y)),
  }
}