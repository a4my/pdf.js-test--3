const url = './docs/pdf-3.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;
  scale = 0.8;

  const canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

  // Comment out for 2 pages rendering
  const secondCanvas = document.querySelector('#pdf-render-2')
  const ctx2 = secondCanvas.getContext('2d')
  
// Render the page
const renderPage = num => {
    if(num === 1) {
        pageIsRendering = true;
      
        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport(scale);
          secondCanvas.height = viewport.height;
          secondCanvas.width = viewport.width;
          secondCanvas.style.border = '1px solid #000'
          secondCanvas.style.opacity = 1
      
          const renderCtx = {
            canvasContext: ctx2,
            viewport
          };
          console.log(renderCtx)
          console.log(secondCanvas)
          page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
      
            if (pageNumIsPending !== null) {
              renderPage(pageNumIsPending);
              pageNumIsPending = null;
            }
          });
      
          // Output current page
          document.querySelector('#page-num').textContent = num;
          document.querySelector('#second-page-num').textContent = null

          // Remove the first empty canvas
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.border = 'hidden'

          // Remove the dash in the page info box
          document.querySelector('.dash').style.display = 'none'
          document.querySelector('.dash').style.marginRight = '0px'
          document.querySelector('#page').textContent = 'Page'

        });
    }
    
    if(num % 2 === 0) {
        canvas.style.display = 'block'
        canvas.style.border = '1px solid #000'

        pageIsRendering = true;
        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport(scale);
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          console.log(canvas)
          const renderCtx = {
            canvasContext: ctx,
            viewport
          };
      
          page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
      
            if (pageNumIsPending !== null) {
              renderPage(pageNumIsPending);
              pageNumIsPending = null;
            }
          });
      
          // Output current page
          document.querySelector('#page-num').textContent = num;
          document.querySelector('#page').textContent = 'Pages'
        });
    
      
        // Comment out for 2 pages rendering
        
        
        if(num !== pdfDoc.pdfInfo.numPages) {
          let secondPage = num + 1
            pdfDoc.getPage(secondPage).then(page => {
            // Set Scale
            const viewport = page.getViewport(scale)
            secondCanvas.height = viewport.height
            secondCanvas.width = viewport.width
            secondCanvas.style.opacity = 1
            console.log(secondCanvas)

        
            const renderCtx = {
                canvasContext: ctx2,
                viewport
            }
        
            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false
        
                if(pageNumIsPending !== null) {
                    renderPage(pageNumIsPending)
                    pageNumIsPending = null
                }
            })
    
            document.querySelector('.dash').style.display = 'block'
            
            // Output current page 
            document.querySelector('#second-page-num').textContent = secondPage
            document.querySelector('.dash').style.display = 'block'
            document.querySelector('#second-page-num').style.display = 'block'
            })          
        } else {
          secondCanvas.style.opacity = 0
          document.querySelector('.dash').style.display = 'none'
          document.querySelector('#second-page-num').style.display = 'none'
          document.querySelector('#page-num').style.marginRight = '4px'
          document.querySelector('#page').textContent = 'Page'
        }
    }
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }

  if(pageNum === 1 || pageNum === 2) {
      pageNum--
  } else {
      pageNum -= 2
  }
  console.log(pageNum)

  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum + 2 > pdfDoc.pdfInfo.numPages) {
    return
  }
  
  if(pageNum === 1) {
    pageNum++
} else {
    pageNum += 2
}
console.log(pageNum)


  queueRenderPage(pageNum);
};

// Get Document
PDFJS
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    console.log(pdfDoc)
    document.querySelector('#page-count').textContent = pdfDoc.pdfInfo.numPages;
    renderPage(pageNum);
  })
  .catch(err => {
    // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });

  
// Zoom out
function zoomOut() {
    scale -= 0.1
    renderPage(pageNum)
    }

// Zoom in
function zoomIn() {
    scale += 0.1
    renderPage(pageNum)
    }

// Move to page 1
function skipToFirstPage() {
    pageNum = 1
    renderPage(1)
}

//Move to last page
function skipToLastPage() {
    if(pdfDoc.pdfInfo.numPages % 2 === 0) {
      pageNum = pdfDoc.pdfInfo.numPages 
      renderPage(pageNum)
    } else if(pdfDoc.pdfInfo.numPages % 2 !== 0) {
      pageNum = pdfDoc.pdfInfo.numPages - 1
      renderPage(pageNum)
    }
}

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);

document.querySelector('#zoom-in').addEventListener('click', zoomIn)
document.querySelector('#zoom-out').addEventListener('click', zoomOut)

document.querySelector('#chevron-left').addEventListener('click', skipToFirstPage)
document.querySelector('#chevron-right').addEventListener('click', skipToLastPage)

// Loader
const loaderContainer = document.querySelector('.loader-container')

function loader() {
  loaderContainer.classList.add('fade-out')
}

function fadeOut() {
  setInterval(loader, 1200)
}

window.onload = fadeOut()