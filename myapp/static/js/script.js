window.onload = function() {
    let canvas = document.getElementById("drawingCanvas");
    let ctx = canvas.getContext("2d");
    let painting = false;

    // **Mobil cihazları desteklemek için dinamik canvas boyutu**
    function adjustCanvasSize() {
        if (window.innerWidth < 900) {
            canvas.width = window.innerWidth * 0.9;  // Mobilde ekranın %90'ı kadar genişlik
            canvas.height = window.innerHeight * 0.5;  // Mobilde ekranın %50'si kadar yükseklik
        } else {
            canvas.width = 800;  // Büyük ekranlarda sabit genişlik
            canvas.height = 500;
        }
    }

    adjustCanvasSize();  // İlk yüklemede boyutu ayarla
    window.addEventListener("resize", adjustCanvasSize);  // Ekran boyutu değişirse tekrar ayarla

    // **Beyaz arka plan ekleme**
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // **Kalınlık ve renk seçimi**
    let brushSize = document.getElementById("brushSize");
    let brushColor = document.getElementById("brushColor");

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        let x, y;
        if (e.touches) {  // **Dokunmatik desteği**
            let touch = e.touches[0];  // İlk dokunma noktasını al
            x = touch.clientX - canvas.getBoundingClientRect().left;
            y = touch.clientY - canvas.getBoundingClientRect().top;
        } else {  // **Fare (mouse) desteği**
            x = e.clientX - canvas.getBoundingClientRect().left;
            y = e.clientY - canvas.getBoundingClientRect().top;
        }

        ctx.lineWidth = brushSize.value;
        ctx.lineCap = "round";
        ctx.strokeStyle = brushColor.value;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        e.preventDefault();  // **Mobilde kaydırma sorununu engellemek için**
    }

    // **Fare olaylarını dinle**
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);

    // **Dokunmatik olaylarını dinle (Mobil uyum için)**
    canvas.addEventListener("touchstart", function(e) {
        startPosition(e);
        e.preventDefault();  // **Mobilde sayfa kaymasını engelle**
    }, { passive: false });

    canvas.addEventListener("touchend", function(e) {
        endPosition();
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchmove", function(e) {
        draw(e);
        e.preventDefault();
    }, { passive: false });

    // **Temizleme butonu**
    document.getElementById("clearButton").addEventListener("click", function() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    });

    // **Kaydetme butonu (Quick Draw formatına uygun kaydetme)**
    document.getElementById("saveButton").addEventListener("click", function() {
        // Yeni bir geçici canvas oluştur (Quick Draw boyutunda)
        let tempCanvas = document.createElement("canvas");
        let tempCtx = tempCanvas.getContext("2d");

        tempCanvas.width = 256;  // Quick Draw için uygun boyut (28x28 veya 256x256 olabilir)
        tempCanvas.height = 256;

        // Beyaz arka plan ekle
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Çizimi küçültüp buraya aktarıyoruz (Ölçekleme)
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

        // Resmi kaydet
        let imageData = tempCanvas.toDataURL("image/png");
        document.getElementById("imageData").value = imageData;
        document.getElementById("saveForm").submit();
    });
};
