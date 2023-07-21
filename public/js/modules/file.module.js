import comment from "./pdf_comment.module.js";

const { PDFDocument, StandardFonts, rgb } = PDFLib;

const createForm = (file, identifier) => {
    const formData = new FormData();

    formData.append(identifier, file);
    formData.append("name", file.name);
    
    return formData;
}

const file_upload = async (file, url, identifier) => {
    const formData = await createForm(file, identifier);

    const response = await $.ajax({
        type: "POST",
        url: url,
        processData: false,
        contentType: false,
        data: formData,
    });

    if (response.status == "200") {
        return response;
    } else {
        return null;
    }
}

const pdf_fix = async (commentObj, page) => {
    const response = await $.ajax({
        type: "POST",
        url: "/contract/file/save",
        data: JSON.stringify({
            commentData: JSON.stringify(commentObj),
            page: page
        }),
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status == 200) {
        comment.clearCommentObj();
    }
}

const pdfView = async (page) => {
    const url = "https://219.255.230.120:8000/contract/file/read";
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[page - 1];

    const { width, height } = firstPage.getSize();

    if (page > 1) {
        const comment_data = comment.getCommentObj();

        await pdf_fix(comment_data, page - 2);
    }

    const option = {
        pdfOpenParams: {
            navpanes: 0,
            toolbar: 0,
            statusbar: 0,
            view: "FitV",
            pagemode:"thumbs",
            page: page
        },
        forcePDFJS: true,
        width: String(width) + "pt",
        height: String(height) + "pt",
    };

    document.getElementById("pdf_cover").style.width = String(width) + "pt";
    document.getElementById("pdf_cover").style.height = String(height) + "pt";

    PDFObject.embed("/contract/file/read", "#pdf_viewer", option);
}

export default {
    file_upload,
    pdfView,
};