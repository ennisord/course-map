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

export function buildLayout(courses) {
  const ZONE_GAP = 320
  const SUBCOL_GAP = 220
  const ROW_GAP = 100

  const byZone = {}
  courses.forEach(c => {
    const zone = Math.floor(c.id / 100)
    if (!byZone[zone]) byZone[zone] = []
    byZone[zone].push(c)
  })

  const positioned = {}
  const sortedZones = Object.keys(byZone).map(Number).sort()
  const globalMax = Math.max(...Object.values(byZone).map(g => g.length))
  const globalHeight = (globalMax - 1) * ROW_GAP
  let zoneX = 0

  sortedZones.forEach(zone => {
    const group = byZone[zone]
    const idSet = new Set(group.map(c => c.id))

    const subcol = {}
    const getSubcol = (course) => {
      if (subcol[course.id] !== undefined) return subcol[course.id]
      const inZonePrereqs = course.prereqs.filter(p => typeof p === 'number' && idSet.has(p))
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
      const colHeight = (subgroup.length - 1) * ROW_GAP
      const startY = (globalHeight - colHeight) / 2
      subgroup.forEach((c, i) => {
        positioned[`${c.dept}-${c.id}`] = {
          x: zoneX + parseInt(sc) * SUBCOL_GAP,
          y: startY + i * ROW_GAP,
        }
      })
    })

    const maxSubcol = Math.max(...Object.keys(bySubcol).map(Number))
    zoneX += ZONE_GAP + maxSubcol * SUBCOL_GAP
  })

  return positioned
}

export function clampOffset(x, y, scale) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pad = 0.85
  const minX = -4000 * scale + vw * pad
  const maxX = vw * (1 - pad + 1)
  const minY = -4000 * scale + vh * pad
  const maxY = vh * (1 - pad + 1)
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  }
}