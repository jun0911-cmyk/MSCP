import comment from "./pdf_comment.module.js";
import loading from "./loading.module.js";
import canvas_comment from "./canvas_comment.module.js";

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

const pdf_fix = async (commentObj, canvas_data, page) => {
    const response = await $.ajax({
        type: "POST",
        url: "/contract/file/save",
        data: JSON.stringify({
            commentData: JSON.stringify(commentObj),
            canvasData: JSON.stringify(canvas_data),
            page: page
        }),
        headers: {
            "Content-Type": "application/json"
        },
        beforeSend: loading.loadingMsg("파일 임시 저장중입니다."),
        complete: loading.completeLoading
    });

    if (response.status == 200) {
        comment.clearCommentObj();
        canvas_comment.clearCommentObj();
    }
}

const pdfView = async (page, socket) => {
    const container = document.getElementById("pdf_viewer");

    if (page > 1) {
        const comment_data = comment.getCommentObj();
        const canvas_comment_data = canvas_comment.getCommentObj();

        await pdf_fix(comment_data, canvas_comment_data, page - 2);
    }

    pdfjsLib.getDocument("/contract/file/read").promise.then(pdfDoc => {
        localStorage.setItem("last_page", pdfDoc.numPages);

        return pdfDoc.getPage(page);
    }).then(pages => {
          const viewport = pages.getViewport({ scale: 1 });

          const scale = Math.min(viewport.width / (viewport.width * 1.3333333333333), viewport.height / (viewport.height * 1.3333333333333));
          
          container.style.width = viewport.width + 2 + "pt";
          container.style.height = viewport.height + 2 + "pt"; 
          
          const canvas = document.createElement('canvas');

          canvas.id = "pdf_object";

          container.appendChild(canvas);

          const context = canvas.getContext('2d');
          canvas.height = viewport.height * 1.3333333333333;
          canvas.width = viewport.width * 1.3333333333333;
  
          const renderContext = {
            canvasContext: context,
            viewport: pages.getViewport({ scale: 0.6 + scale })
          };

          pages.render(renderContext).promise.then((function() {
            console.log(container.childNodes);

            if (container.childNodes.length > 1) {
                container.removeChild(container.childNodes[4]);
            }

            container.appendChild(canvas);
          }));

          canvas.addEventListener("click", (event) => {
            comment.createInputBox(event, socket, page, canvas, container);
          });
                
          canvas.addEventListener("mousemove", comment.moveSetInputBox);
        }).catch(err => {
          console.log(err);
        });
}

export default {
    file_upload,
    pdfView,
};