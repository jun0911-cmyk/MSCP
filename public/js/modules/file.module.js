const createForm = (file, accesser, identifier) => {
    const formData = new FormData();

    formData.append(identifier, file);
    formData.append("accesser", accesser);
    formData.append("name", file.name);
    
    return formData;
}

const file_upload = async (file, accesser, url, identifier) => {
    const formData = await createForm(file, accesser, identifier);

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

const pdfView = (page) => {
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
        width:"103%",
        height:"100%",
    };

    PDFObject.embed("/contract/file/read", "#pdf_viewer", option);
}

export default {
    file_upload,
    pdfView,
};