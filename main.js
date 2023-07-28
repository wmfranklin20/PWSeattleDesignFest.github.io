function updateWindowSize () {
    const sizeDiv = document.getElementById('sizediv');
    const width = window.innerWidth;
    const height = window.innerHeight;
    sizeDiv.textContent = `Window size: ${width} x ${height}`;
}
updateWindowSize();
window.addEventListener('resize', updateWindowSize);