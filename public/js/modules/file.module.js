const createForm = (file) => {
    const formData = new FormData();

    formData.append("contract_file", file);
    formData.append("name", file.name);
    
    return formData;
}

const file_upload = async (file) => {
    const formData = await createForm(file);

    const response = await $.ajax({
        type: "POST",
        url: "/contract/file/upload",
        processData: false,
        contentType: false,
        data: formData,
    });

    if (response.status == "200" && response.message == "success") {
        return "success";
    } else {
        return "failure";
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