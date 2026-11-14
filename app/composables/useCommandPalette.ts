/** Open state of the module's command palette, shared by the shell and the sidebar's search button. */
export function useCommandPalette() {
  const open = useState('command-palette-open', () => false)

  function show() {
    open.value = true
  }

  return { open, show }
}
