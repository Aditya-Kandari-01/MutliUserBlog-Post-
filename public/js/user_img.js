const inp = document.getElementById("cur_img")
const user_img = document.getElementById("preview")
const upload_img = document.getElementById("upload")
upload_img.addEventListener("click", (e) => {
    e.preventDefault()
    const file = inp.files[0]
    if (!file) {
        return
    }
    user_img.src = URL.createObjectURL(file)
})