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

export default {
    file_upload,
};