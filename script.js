/* =========================================================
   КАТАЛОГ СЕРТИФІКАТІВ
   Версія з IndexedDB для зберігання PDF
   ========================================================= */


/* =========================================================
   НАСТРОЙКИ
   ========================================================= */

const DATA_KEY = "certificate_catalog_data";

const DB_NAME = "CertificateCatalogDB";
const DB_VERSION = 1;
const PDF_STORE = "pdfFiles";

let database = null;


/* =========================================================
   ЭЛЕМЕНТЫ HTML
   ========================================================= */

const certificatesContainer =
    document.getElementById("certificatesContainer");

const emptyState =
    document.getElementById("emptyState");

const certificateCount =
    document.getElementById("certificateCount");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const addCertificateButton =
    document.getElementById("addCertificateButton");

const emptyAddButton =
    document.getElementById("emptyAddButton");


/* =========================================================
   MODAL
   ========================================================= */

const certificateModal =
    document.getElementById("certificateModal");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelButton =
    document.getElementById("cancelButton");

const certificateForm =
    document.getElementById("certificateForm");

const modalTitle =
    document.getElementById("modalTitle");


/* =========================================================
   PDF MODAL
   ========================================================= */

const pdfModal =
    document.getElementById("pdfModal");

const closePdfButton =
    document.getElementById("closePdfButton");

const pdfViewer =
    document.getElementById("pdfViewer");

const pdfModalTitle =
    document.getElementById("pdfModalTitle");


/* =========================================================
   FORM
   ========================================================= */

const certificateId =
    document.getElementById("certificateId");

const certificateName =
    document.getElementById("certificateName");

const certificateSeries =
    document.getElementById("certificateSeries");

const certificateEquipment =
    document.getElementById("certificateEquipment");

const certificateIssued =
    document.getElementById("certificateIssued");

const certificateExpires =
    document.getElementById("certificateExpires");

const certificateStatus =
    document.getElementById("certificateStatus");

const certificateNotes =
    document.getElementById("certificateNotes");

const certificatePdf =
    document.getElementById("certificatePdf");


/* =========================================================
   PDF UI
   ========================================================= */

const currentPdf =
    document.getElementById("currentPdf");

const currentPdfName =
    document.getElementById("currentPdfName");

const removePdfButton =
    document.getElementById("removePdfButton");


/* =========================================================
   СТАТУСЫ
   ========================================================= */

const statusNames = {

    valid: "✓ Чинний",

    warning: "⚠ Закінчується",

    expired: "✕ Прострочений",

    draft: "◌ Чернетка"

};


/* =========================================================
   DEMO DATA
   ========================================================= */

const defaultCertificates = [

    {
        id: "sed-ei90",

        name:
            "Клапани протипожежні універсальні SED",

        series:
            "SED, EI 90",

        equipment:
            "Протипожежні клапани",

        issued:
            "2025-12-16",

        expires:
            "2028-12-16",

        status:
            "valid",

        notes:
            "Клас вогнестійкості EI 90.",

        pdfId:
            null,

        pdfName:
            ""
    },


    {
        id: "sed-ei120",

        name:
            "Клапани протипожежні універсальні SED",

        series:
            "SED, EI 120",

        equipment:
            "Протипожежні клапани",

        issued:
            "2025-12-16",

        expires:
            "2028-12-16",

        status:
            "valid",

        notes:
            "Клас вогнестійкості EI 120.",

        pdfId:
            null,

        pdfName:
            ""
    }

];


/* =========================================================
   INDEXED DB
   ========================================================= */

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            PDF_STORE
                        )
                    ) {

                        db.createObjectStore(
                            PDF_STORE
                        );

                    }

                };


            request.onsuccess =
                event => {

                    database =
                        event.target.result;

                    resolve(database);

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   СОХРАНИТЬ PDF В INDEXED DB
   ========================================================= */

function savePdfToDatabase(file) {

    return new Promise(
        (resolve, reject) => {

            const id =
                generateId();


            const transaction =
                database.transaction(
                    PDF_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.put(
                    file,
                    id
                );


            request.onsuccess =
                () => {

                    resolve(id);

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   ПОЛУЧИТЬ PDF
   ========================================================= */

function getPdfFromDatabase(id) {

    return new Promise(
        (resolve, reject) => {

            if (!id) {

                resolve(null);

                return;

            }


            const transaction =
                database.transaction(
                    PDF_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.get(id);


            request.onsuccess =
                () => {

                    resolve(
                        request.result || null
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   УДАЛИТЬ PDF
   ========================================================= */

function removePdfFromDatabase(id) {

    return new Promise(
        (resolve, reject) => {

            if (!id) {

                resolve();

                return;

            }


            const transaction =
                database.transaction(
                    PDF_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.delete(id);


            request.onsuccess =
                () => {

                    resolve();

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   ПОЛУЧИТЬ ВСЕ СЕРТИФИКАТЫ
   ========================================================= */

function getCertificates() {

    const saved =
        localStorage.getItem(
            DATA_KEY
        );


    if (!saved) {

        localStorage.setItem(
            DATA_KEY,
            JSON.stringify(
                defaultCertificates
            )
        );


        return [
            ...defaultCertificates
        ];

    }


    try {

        return JSON.parse(saved);

    }

    catch (error) {

        console.error(
            "Помилка читання даних:",
            error
        );


        return [
            ...defaultCertificates
        ];

    }

}


/* =========================================================
   СОХРАНИТЬ СЕРТИФИКАТЫ
   ========================================================= */

function saveCertificates(certificates) {

    localStorage.setItem(
        DATA_KEY,
        JSON.stringify(certificates)
    );

}


/* =========================================================
   GENERATE ID
   ========================================================= */

function generateId() {

    return (

        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)

    );

}


/* =========================================================
   ФОРМАТ ДАТЫ
   ========================================================= */

function formatDate(date) {

    if (!date) {

        return "—";

    }


    const parsed =
        new Date(
            date + "T00:00:00"
        );


    if (isNaN(parsed)) {

        return "—";

    }


    return parsed.toLocaleDateString(
        "uk-UA",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   ПОИСК
   ========================================================= */

function getFilteredCertificates() {

    const certificates =
        getCertificates();


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    return certificates.filter(
        certificate => {

            const text = [

                certificate.name,

                certificate.series,

                certificate.equipment,

                certificate.notes,

                certificate.pdfName

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                text.includes(search);


            const matchesStatus =
                selectedStatus === "all" ||
                certificate.status ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   СОЗДАНИЕ PDF PREVIEW
   ========================================================= */

async function createPdfPreview(
    certificate,
    previewContainer
) {

    if (!certificate.pdfId) {

        previewContainer.innerHTML = `

            <div class="pdf-placeholder">

                <div class="pdf-icon">
                    PDF
                </div>

                <span>
                    PDF-файл не завантажено
                </span>

            </div>

        `;

        return;

    }


    try {

        const file =
            await getPdfFromDatabase(
                certificate.pdfId
            );


        if (!file) {

            previewContainer.innerHTML = `

                <div class="pdf-placeholder">

                    <div class="pdf-icon">
                        PDF
                    </div>

                    <span>
                        PDF-файл не знайдено
                    </span>

                </div>

            `;

            return;

        }


        const url =
            URL.createObjectURL(file);


        const iframe =
            document.createElement(
                "iframe"
            );


        iframe.src =
            url +
            "#page=1&view=FitH";


        iframe.title =
            certificate.name;


        previewContainer.appendChild(
            iframe
        );


        previewContainer.style.cursor =
            "pointer";


        previewContainer.addEventListener(
            "click",
            () => {

                openPdf(
                    certificate
                );

            }
        );


        /*
            Не удаляем URL сразу.
            Он нужен iframe.
        */

    }

    catch (error) {

        console.error(
            "Помилка PDF:",
            error
        );

    }

}


/* =========================================================
   СОЗДАНИЕ КАРТОЧКИ
   ========================================================= */

function createCertificateCard(
    certificate
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "glass certificate-card";


    /* -----------------------------------------------------
       PDF
       ----------------------------------------------------- */

    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "pdf-preview";


    card.appendChild(
        preview
    );


    createPdfPreview(
        certificate,
        preview
    );


    /* -----------------------------------------------------
       CONTENT
       ----------------------------------------------------- */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "certificate-content";


    /* -----------------------------------------------------
       TOP
       ----------------------------------------------------- */

    const top =
        document.createElement(
            "div"
        );


    top.className =
        "certificate-top";


    /* STATUS */

    const status =
        document.createElement(
            "span"
        );


    status.className =
        `status ${certificate.status}`;


    status.textContent =
        statusNames[
            certificate.status
        ] ||
        certificate.status;


    top.appendChild(
        status
    );


    /* ACTIONS */

    const actions =
        document.createElement(
            "div"
        );


    actions.style.display =
        "flex";

    actions.style.gap =
        "6px";


    /* EDIT */

    const editButton =
        document.createElement(
            "button"
        );


    editButton.type =
        "button";


    editButton.className =
        "edit-button";


    editButton.title =
        "Редагувати";


    editButton.textContent =
        "⋯";


    editButton.addEventListener(
        "click",
        () => {

            openEditModal(
                certificate
            );

        }
    );


    actions.appendChild(
        editButton
    );


    /* DELETE */

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "edit-button";


    deleteButton.title =
        "Видалити";


    deleteButton.textContent =
        "🗑";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteCertificate(
                certificate.id
            );

        }
    );


    actions.appendChild(
        deleteButton
    );


    top.appendChild(
        actions
    );


    content.appendChild(
        top
    );


    /* -----------------------------------------------------
       TITLE
       ----------------------------------------------------- */

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        certificate.name;


    content.appendChild(
        title
    );


    /* -----------------------------------------------------
       META
       ----------------------------------------------------- */

    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "certificate-meta";


    const metaParts = [];


    if (certificate.series) {

        metaParts.push(
            certificate.series
        );

    }


    if (certificate.equipment) {

        metaParts.push(
            certificate.equipment
        );

    }


    meta.textContent =
        metaParts.join(" • ");


    content.appendChild(
        meta
    );


    /* -----------------------------------------------------
       DATES
       ----------------------------------------------------- */

    const dates =
        document.createElement(
            "div"
        );


    dates.className =
        "certificate-dates";


    dates.innerHTML = `

        <div>
            <strong>Виданий:</strong>
            ${formatDate(
                certificate.issued
            )}
        </div>

        <div>
            <strong>Дійсний до:</strong>
            ${formatDate(
                certificate.expires
            )}
        </div>

    `;


    content.appendChild(
        dates
    );


    /* -----------------------------------------------------
       PDF NAME
       ----------------------------------------------------- */

    if (certificate.pdfName) {

        const fileName =
            document.createElement(
                "div"
            );


        fileName.className =
            "certificate-meta";


        fileName.style.marginTop =
            "8px";


        fileName.textContent =
            `📎 ${certificate.pdfName}`;


        content.appendChild(
            fileName
        );

    }


    /* -----------------------------------------------------
       NOTES
       ----------------------------------------------------- */

  /* -----------------------------------------------------
   NOTES
   ----------------------------------------------------- */

const notesWrapper =
    document.createElement("div");

notesWrapper.className =
    "certificate-notes-wrapper";


const notes =
    document.createElement("div");

notes.className =
    "certificate-notes";


const fullText =
    certificate.notes ||
    "Додаткової інформації немає.";


/*
    Сколько символов показываем
    в свернутом состоянии.
*/

const MAX_LENGTH = 180;


/*
    Если текст короткий —
    кнопку "Показати більше"
    вообще не создаём.
*/

if (fullText.length <= MAX_LENGTH) {

    notes.textContent =
        fullText;

    notesWrapper.appendChild(
        notes
    );

}


/*
    Если текст длинный —
    обрезаем его.
*/

else {

    const shortText =
        fullText.substring(
            0,
            MAX_LENGTH
        ).trim();


    notes.textContent =
        shortText + "…";


    notesWrapper.appendChild(
        notes
    );


    /*
        Кнопка раскрытия
    */

    const moreButton =
        document.createElement(
            "button"
        );


    moreButton.type =
        "button";


    moreButton.className =
        "show-more-button";


    moreButton.textContent =
        "Показати більше";


    /*
        При нажатии показываем
        полный текст.
    */

    moreButton.addEventListener(
        "click",
        () => {

            const isExpanded =
                notes.classList.contains(
                    "expanded"
                );


            if (isExpanded) {

                notes.textContent =
                    shortText + "…";

                notes.classList.remove(
                    "expanded"
                );

                moreButton.textContent =
                    "Показати більше";

            }

            else {

                notes.textContent =
                    fullText;

                notes.classList.add(
                    "expanded"
                );

                moreButton.textContent =
                    "Сховати";

            }

        }
    );


    notesWrapper.appendChild(
        moreButton
    );

}


content.appendChild(
    notesWrapper
);


    /* -----------------------------------------------------
       OPEN PDF
       ----------------------------------------------------- */

    if (certificate.pdfId) {

        const openButton =
            document.createElement(
                "a"
            );


        openButton.href =
            "#";


        openButton.className =
            "open-pdf-button";


        openButton.textContent =
            "Відкрити PDF ↗";


        openButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openPdf(
                    certificate
                );

            }
        );


        content.appendChild(
            openButton
        );

    }


    card.appendChild(
        content
    );


    return card;

}


/* =========================================================
   ОТРИСОВКА
   ========================================================= */

function renderCertificates() {

    const certificates =
        getFilteredCertificates();


    certificatesContainer.innerHTML =
        "";


    /* COUNTER */

    const count =
        certificates.length;


    if (count === 1) {

        certificateCount.textContent =
            "1 сертифікат";

    }

    else {

        certificateCount.textContent =
            `${count} сертифікатів`;

    }


    /* EMPTY */

    if (count === 0) {

        certificatesContainer.style.display =
            "none";


        emptyState.style.display =
            "block";


        return;

    }


    certificatesContainer.style.display =
        "grid";


    emptyState.style.display =
        "none";


    /* CARDS */

    certificates.forEach(
        certificate => {

            certificatesContainer.appendChild(

                createCertificateCard(
                    certificate
                )

            );

        }
    );

}


/* =========================================================
   ОТКРЫТЬ PDF
   ========================================================= */

async function openPdf(certificate) {

    if (!certificate.pdfId) {

        alert(
            "Для цього сертифіката PDF не завантажено."
        );

        return;

    }


    try {

        const file =
            await getPdfFromDatabase(
                certificate.pdfId
            );


        if (!file) {

            alert(
                "PDF-файл не знайдено."
            );

            return;

        }


        const url =
            URL.createObjectURL(file);


        pdfViewer.src =
            url +
            "#page=1&view=FitH";


        pdfModalTitle.textContent =
            certificate.name;


        pdfModal.style.display =
            "flex";


        /*
            Запоминаем URL,
            чтобы освободить его после закрытия.
        */

        pdfModal.dataset.url =
            url;

    }

    catch (error) {

        console.error(error);

        alert(
            "Не вдалося відкрити PDF."
        );

    }

}


/* =========================================================
   ЗАКРЫТЬ PDF
   ========================================================= */

function closePdf() {

    const url =
        pdfModal.dataset.url;


    if (url) {

        URL.revokeObjectURL(
            url
        );

    }


    pdfViewer.src =
        "";


    pdfModal.style.display =
        "none";

}


/* =========================================================
   ОТКРЫТЬ MODAL ДОБАВЛЕНИЯ
   ========================================================= */

function openAddModal() {

    modalTitle.textContent =
        "Додати сертифікат";


    certificateForm.reset();


    certificateId.value =
        "";


    certificateStatus.value =
        "valid";


    currentPdf.style.display =
        "none";


    currentPdfName.textContent =
        "";


    certificateModal.style.display =
        "flex";


    certificateName.focus();

}


/* =========================================================
   ОТКРЫТЬ MODAL РЕДАКТИРОВАНИЯ
   ========================================================= */

function openEditModal(
    certificate
) {

    modalTitle.textContent =
        "Редагувати сертифікат";


    certificateId.value =
        certificate.id;


    certificateName.value =
        certificate.name || "";


    certificateSeries.value =
        certificate.series || "";


    certificateEquipment.value =
        certificate.equipment || "";


    certificateIssued.value =
        certificate.issued || "";


    certificateExpires.value =
        certificate.expires || "";


    certificateStatus.value =
        certificate.status ||
        "valid";


    certificateNotes.value =
        certificate.notes || "";


    certificatePdf.value =
        "";


    /*
        Показываем существующий PDF.
    */

    if (
        certificate.pdfId &&
        certificate.pdfName
    ) {

        currentPdf.style.display =
            "flex";


        currentPdfName.textContent =
            certificate.pdfName;

    }

    else {

        currentPdf.style.display =
            "none";

    }


    /*
        Сохраняем ID старого PDF
        во временном атрибуте.
    */

    certificateForm.dataset.oldPdfId =
        certificate.pdfId || "";


    certificateModal.style.display =
        "flex";


    certificateName.focus();

}


/* =========================================================
   ЗАКРЫТЬ MODAL
   ========================================================= */

function closeModal() {

    certificateModal.style.display =
        "none";


    certificateForm.reset();


    certificateForm.dataset.oldPdfId =
        "";

}


/* =========================================================
   СОХРАНЕНИЕ
   ========================================================= */

async function saveCertificate(event) {

    event.preventDefault();


    const certificates =
        getCertificates();


    const id =
        certificateId.value ||
        generateId();


    const existingIndex =
        certificates.findIndex(
            certificate =>
                certificate.id === id
        );


    const oldCertificate =
        existingIndex !== -1
            ? certificates[
                existingIndex
            ]
            : null;


    /* -----------------------------------------------------
       ДАННЫЕ
       ----------------------------------------------------- */

    const data = {

        id: id,

        name:
            certificateName.value.trim(),

        series:
            certificateSeries.value.trim(),

        equipment:
            certificateEquipment.value.trim(),

        issued:
            certificateIssued.value,

        expires:
            certificateExpires.value,

        status:
            certificateStatus.value,

        notes:
            certificateNotes.value.trim(),

        pdfId:
            oldCertificate?.pdfId ||
            null,

        pdfName:
            oldCertificate?.pdfName ||
            ""

    };


    /* -----------------------------------------------------
       ПРОВЕРКА
       ----------------------------------------------------- */

    if (!data.name) {

        alert(
            "Вкажіть назву сертифіката."
        );

        certificateName.focus();

        return;

    }


    /* -----------------------------------------------------
       НОВЫЙ PDF
       ----------------------------------------------------- */

    const selectedFile =
        certificatePdf.files[0];


    if (selectedFile) {

        if (
            selectedFile.type !==
            "application/pdf"
        ) {

            alert(
                "Можна завантажувати тільки PDF-файли."
            );

            return;

        }


        /*
            Максимальный размер —
            100 MB.
        */

        const maxSize =
            100 * 1024 * 1024;


        if (
            selectedFile.size >
            maxSize
        ) {

            alert(
                "PDF-файл завеликий. Максимальний розмір — 100 MB."
            );

            return;

        }


        /*
            Сохраняем новый PDF.
        */

        const newPdfId =
            await savePdfToDatabase(
                selectedFile
            );


        /*
            Если был старый PDF,
            удаляем его.
        */

        if (
            oldCertificate &&
            oldCertificate.pdfId
        ) {

            await removePdfFromDatabase(
                oldCertificate.pdfId
            );

        }


        data.pdfId =
            newPdfId;


        data.pdfName =
            selectedFile.name;

    }


    /* -----------------------------------------------------
       СОХРАНЯЕМ СЕРТИФИКАТ
       ----------------------------------------------------- */

    if (existingIndex !== -1) {

        certificates[
            existingIndex
        ] = data;

    }

    else {

        certificates.unshift(
            data
        );

    }


    saveCertificates(
        certificates
    );


    renderCertificates();


    closeModal();

}


/* =========================================================
   УДАЛЕНИЕ СЕРТИФИКАТА
   ========================================================= */

async function deleteCertificate(id) {

    const certificates =
        getCertificates();


    const certificate =
        certificates.find(
            item =>
                item.id === id
        );


    if (!certificate) {

        return;

    }


    const confirmed =
        confirm(
            `Видалити сертифікат "${certificate.name}"?\n\nPDF-файл також буде видалено.`
        );


    if (!confirmed) {

        return;

    }


    /*
        Удаляем PDF.
    */

    if (
        certificate.pdfId
    ) {

        await removePdfFromDatabase(
            certificate.pdfId
        );

    }


    /*
        Удаляем запись.
    */

    const updated =
        certificates.filter(
            item =>
                item.id !== id
        );


    saveCertificates(
        updated
    );


    renderCertificates();

}


/* =========================================================
   УДАЛИТЬ ТОЛЬКО PDF
   ========================================================= */

async function removeCurrentPdf() {

    const id =
        certificateId.value;


    const certificates =
        getCertificates();


    const certificate =
        certificates.find(
            item =>
                item.id === id
        );


    if (!certificate) {

        return;

    }


    if (!certificate.pdfId) {

        return;

    }


    const confirmed =
        confirm(
            "Видалити PDF-файл?"
        );


    if (!confirmed) {

        return;

    }


    await removePdfFromDatabase(
        certificate.pdfId
    );


    certificate.pdfId =
        null;


    certificate.pdfName =
        "";


    saveCertificates(
        certificates
    );


    currentPdf.style.display =
        "none";


    certificatePdf.value =
        "";


    renderCertificates();

}


/* =========================================================
   СОБЫТИЯ
   ========================================================= */


/*
    Добавление
*/

addCertificateButton.addEventListener(
    "click",
    openAddModal
);


emptyAddButton.addEventListener(
    "click",
    openAddModal
);


/*
    Сохранение
*/

certificateForm.addEventListener(
    "submit",
    saveCertificate
);


/*
    Закрытие
*/

closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelButton.addEventListener(
    "click",
    closeModal
);


/*
    Удаление PDF
*/

if (removePdfButton) {

    removePdfButton.addEventListener(
        "click",
        removeCurrentPdf
    );

}


/*
    PDF
*/

closePdfButton.addEventListener(
    "click",
    closePdf
);


/*
    Клик вне модального окна
*/

certificateModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            certificateModal
        ) {

            closeModal();

        }

    }
);


pdfModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            pdfModal
        ) {

            closePdf();

        }

    }
);


/*
    ESC
*/

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

            closePdf();

        }

    }
);


/*
    Поиск
*/

searchInput.addEventListener(
    "input",
    renderCertificates
);


/*
    Фильтр
*/

statusFilter.addEventListener(
    "change",
    renderCertificates
);


/* =========================================================
   АВТОМАТИЧЕСКИЙ СТАТУС
   ========================================================= */

function calculateStatus(
    expires
) {

    if (!expires) {

        return "draft";

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiration =
        new Date(
            expires +
            "T00:00:00"
        );


    if (
        expiration <
        today
    ) {

        return "expired";

    }


    const difference =
        expiration.getTime() -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    /*
        90 дней или меньше —
        предупреждение.
    */

    if (days <= 90) {

        return "warning";

    }


    return "valid";

}


/* =========================================================
   ОБНОВЛЕНИЕ СТАТУСОВ
   ========================================================= */

function updateStatuses() {

    const certificates =
        getCertificates();


    let changed =
        false;


    certificates.forEach(
        certificate => {

            /*
                Черновики вручную
                не меняем.
            */

            if (
                certificate.status ===
                "draft"
            ) {

                return;

            }


            if (
                !certificate.expires
            ) {

                return;

            }


            const newStatus =
                calculateStatus(
                    certificate.expires
                );


            if (
                certificate.status !==
                newStatus
            ) {

                certificate.status =
                    newStatus;

                changed =
                    true;

            }

        }
    );


    if (changed) {

        saveCertificates(
            certificates
        );

    }

}


/* =========================================================
   ЗАПУСК
   ========================================================= */

async function init() {

    try {

        /*
            Сначала открываем
            IndexedDB.
        */

        await openDatabase();


        /*
            Потом обновляем статусы.
        */

        updateStatuses();


        /*
            И только после этого
            рисуем каталог.
        */

        renderCertificates();

    }

    catch (error) {

        console.error(
            "Не вдалося запустити каталог:",
            error
        );


        alert(
            "Не вдалося запустити сховище PDF. Перевірте, що браузер дозволяє IndexedDB."
        );

    }

}


/* =========================================================
   START
   ========================================================= */

init();