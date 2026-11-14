<script setup lang="ts">
/**
 * Contour lines of an imaginary camp site: two summits, drawn as nested closed curves.
 * Purely decorative and static; one line is in the accent colour. With `camp` the tent of the logo
 * stands on the first summit.
 */
const props = withDefaults(defineProps<{
  /** Fewer, fainter lines for error screens */
  quiet?: boolean
  /** Pitch the logo's tent on the main summit (it sits on `bg-muted`, the sign-in hero's surface) */
  camp?: boolean
}>(), { quiet: false, camp: false })

interface Summit {
  x: number
  y: number
  rings: number
  step: number
  /** Shape of the hill: amplitude and phase of two harmonics */
  wobble: [number, number, number, number]
}

const SUMMITS: Summit[] = [
  { x: 330, y: 300, rings: 11, step: 30, wobble: [0.16, 0.6, 0.07, 2.1] },
  { x: 640, y: 560, rings: 8, step: 27, wobble: [0.2, 1.9, 0.09, 0.4] },
]

const POINTS = 72
// The tent and the clearing around it, which takes the place of the innermost rings
const CAMP_SIZE = 104
const CAMP_CLEARING = 3

function ring(summit: Summit, index: number): string {
  const radius = 22 + index * summit.step
  const [a1, p1, a2, p2] = summit.wobble
  const points: string[] = []
  for (let i = 0; i < POINTS; i++) {
    const angle = (i / POINTS) * Math.PI * 2
    // Outer rings drift and flatten a little, like real terrain
    const r = radius * (1 + a1 * Math.sin(2 * angle + p1 + index * 0.11) + a2 * Math.sin(5 * angle + p2 - index * 0.07))
    const x = summit.x + r * Math.cos(angle) * 1.18
    const y = summit.y + r * Math.sin(angle)
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${points.join('L')}Z`
}

const lines = computed(() => SUMMITS.flatMap((summit, summitIndex) =>
  Array.from({ length: props.quiet ? Math.ceil(summit.rings / 2) : summit.rings }, (_, index) => ({
    index,
    summitIndex,
    key: `${summitIndex}-${index}`,
    d: ring(summit, props.quiet ? index * 2 : index),
    // Every fifth line is an index contour, drawn stronger
    strong: index % 5 === 0,
    accent: summitIndex === 0 && index === 3 && !props.quiet,
  })),
).filter(line => !(props.camp && line.summitIndex === 0 && line.index < CAMP_CLEARING)))

// Where the tent stands
const site = SUMMITS[0]!
</script>

<template>
  <svg
    viewBox="0 0 900 800"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    aria-hidden="true"
  >
    <path
      v-for="line in lines"
      :key="line.key"
      :d="line.d"
      :stroke="line.accent ? 'var(--ui-secondary)' : 'var(--ui-primary)'"
      :stroke-width="line.accent ? 2.5 : line.strong ? 1.5 : 1"
      :opacity="line.accent ? 1 : quiet ? 0.18 : line.strong ? 0.5 : 0.28"
      stroke-linejoin="round"
    />
    <AppLogo
      v-if="camp"
      :x="site.x - CAMP_SIZE / 2"
      :y="site.y - CAMP_SIZE / 2"
      :width="CAMP_SIZE"
      :height="CAMP_SIZE"
    />
  </svg>
</template>
