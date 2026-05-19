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

// Returns the canonical key for a course (uses first id if multi-id)
export function getCourseKey(course) {
  const id = Array.isArray(course.id) ? course.id[0] : course.id
  return `${course.dept}-${id}`
}

// Returns all keys a course responds to (one per id)
export function getCourseKeys(course) {
  const ids = Array.isArray(course.id) ? course.id : [course.id]
  return ids.map(id => `${course.dept}-${id}`)
}

export function resolvePrereq(prereq, courseList) {
  if (typeof prereq === 'number') {
    const match = courseList.find(c => {
      const ids = Array.isArray(c.id) ? c.id : [c.id]
      return ids.includes(prereq)
    })
    return match ? getCourseKey(match) : null
  }
  const parts = prereq.trim().split(/\s+/)
  if (parts.length < 2) return null
  const dept = parts[0]
  const id = parseInt(parts[1])
  const match = courseList.find(c => {
    if (c.dept !== dept) return false
    const ids = Array.isArray(c.id) ? c.id : [c.id]
    return ids.includes(id)
  })
  return match ? getCourseKey(match) : null
}

export function getBezier(x1, y1, x2, y2) {
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}

export function buildLayout(courses) {
  const ZONE_GAP = 400
  const SUBCOL_GAP = 250
  const ROW_GAP = 140
  const NODE_WIDTH = 176

  const isElective = c => c.tags.length === 0
  const visibleCourses = courses.filter(c => !isElective(c))
  const electiveCourses = courses.filter(isElective)

  // Use first id for zone bucketing
  const primaryId = c => Array.isArray(c.id) ? c.id[0] : c.id

  const byZone = {}
  visibleCourses.forEach(c => {
    const zone = Math.floor(primaryId(c) / 100)
    if (!byZone[zone]) byZone[zone] = []
    byZone[zone].push(c)
  })

  const electivesByZone = {}
  electiveCourses.forEach(c => {
    const zone = Math.floor(primaryId(c) / 100)
    if (!electivesByZone[zone]) electivesByZone[zone] = []
    electivesByZone[zone].push(c)
  })

  Object.keys(electivesByZone).forEach(zone => {
    if (!byZone[zone]) byZone[zone] = []
  })

  const positioned = {}
  const sortedZones = Object.keys(byZone).map(Number).sort()
  const allGroupSizes = sortedZones.map(z => byZone[z].length + (electivesByZone[z] ? 1 : 0))
  const globalMax = Math.max(...allGroupSizes, 1)
  let zoneX = 0

  const collapsedElectives = {}
  const zoneExtents = {}

  sortedZones.forEach(zone => {
    const group = byZone[zone]
    // All ids in this zone (flattened across multi-id courses)
    const idSet = new Set(group.flatMap(c => Array.isArray(c.id) ? c.id : [c.id]))

    const subcol = {}
    const getSubcol = (course) => {
      const pid = primaryId(course)
      if (subcol[pid] !== undefined) return subcol[pid]

      const inZonePrereqs = course.prereqs.filter(p => {
        if (typeof p === 'number') return idSet.has(p)
        const parts = p.trim().split(/\s+/)
        if (parts.length < 2) return false
        return idSet.has(parseInt(parts[1]))
      }).map(p => {
        if (typeof p === 'number') return p
        return parseInt(p.trim().split(/\s+/)[1])
      })

      if (inZonePrereqs.length === 0) { subcol[pid] = 0; return 0 }
      const max = Math.max(...inZonePrereqs.map(depId => {
        const prereq = group.find(c => {
          const ids = Array.isArray(c.id) ? c.id : [c.id]
          return ids.includes(depId)
        })
        return prereq ? getSubcol(prereq) : 0
      }))
      subcol[pid] = max + 1
      return max + 1
    }

    group.forEach(c => getSubcol(c))

    const bySubcol = {}
    group.forEach(c => {
      const sc = subcol[primaryId(c)]
      if (!bySubcol[sc]) bySubcol[sc] = []
      bySubcol[sc].push(c)
    })

    Object.entries(bySubcol).forEach(([sc, subgroup]) => {
      const startY = 50
      subgroup.forEach((c, i) => {
        const pos = { x: zoneX + parseInt(sc) * SUBCOL_GAP, y: startY + i * ROW_GAP }
        // Register position under ALL keys the course responds to
        getCourseKeys(c).forEach(key => { positioned[key] = pos })
      })
    })

    if (electivesByZone[zone]) {
      const col0Courses = bySubcol[0] || []
      const col0Ys = col0Courses.map(c => positioned[getCourseKey(c)]?.y ?? 0)
      const bottomY = col0Ys.length > 0 ? Math.max(...col0Ys) + ROW_GAP : 40
      const ghostX = zoneX
      const ghostKey = `ghost-${zone}`
      positioned[ghostKey] = { x: ghostX, y: bottomY }
      collapsedElectives[ghostKey] = { courses: electivesByZone[zone], x: ghostX, y: bottomY }
    }

    const maxSubcol = Object.keys(bySubcol).length > 0
      ? Math.max(...Object.keys(bySubcol).map(Number))
      : 0

    zoneExtents[zone] = {
      startX: zoneX - NODE_WIDTH / 2,
      endX: zoneX + maxSubcol * SUBCOL_GAP + NODE_WIDTH / 2,
    }

    zoneX += ZONE_GAP + maxSubcol * SUBCOL_GAP
  })

  return { layout: positioned, collapsedElectives, zoneExtents }
}

let _contentBounds = null
export function setContentBounds(bounds) { _contentBounds = bounds }

export function clampOffset(x, y, scale) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const MARGIN = 120

  if (_contentBounds) {
    const cLeft   = _contentBounds.minX * scale
    const cRight  = _contentBounds.maxX * scale
    const cTop    = _contentBounds.minY * scale
    const cBottom = _contentBounds.maxY * scale
    return {
      x: Math.min(vw - MARGIN - cLeft, Math.max(MARGIN - cRight, x)),
      y: Math.min(vh - MARGIN - cTop, Math.max(MARGIN - cBottom, y)),
    }
  }

  const pad = 0.85
  return {
    x: Math.min(vw * 2, Math.max(-4000 * scale + vw * pad, x)),
    y: Math.min(vh * 2, Math.max(-4000 * scale + vh * pad, y)),
  }
}