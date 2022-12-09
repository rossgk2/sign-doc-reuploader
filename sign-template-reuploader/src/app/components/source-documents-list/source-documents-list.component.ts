import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {DownloadService} from '../../services/download.service';

@Component({
  selector: 'app-source-documents-list',
  templateUrl: './source-documents-list.component.html',
  styleUrls: ['./source-documents-list.component.scss']
})
export class SourceDocumentsListComponent implements OnInit {
  documentListForm = this.formBuilder.group({
    documents: this.formBuilder.array([])
  });

  documentIds: string[] = [];
  readyForDownload: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private downloadService: DownloadService) {
  }

  get documents() {
    return this.documentListForm.controls['documents'] as FormArray;
  }

  populateDocForm(libraryDocumentList: any) {
    this.readyForDownload = true;
    libraryDocumentList.forEach(template => {
      const documentForm = this.formBuilder.group({
        name: [template.name],
        include: ['']
      });
      this.documents.push(documentForm);
    });
  }

  getDocumentList(): void {

    let documentsCall = this.downloadService.getAllDocuments();
    console.log('starting call!');

    documentsCall.subscribe(data => {
      if (data.status === 200) {
        console.log('call was a success! time to get a beer!');
        let libraryDocumentList: any = (data.body as any).libraryDocumentList; // TS doesn't know that data.body has a libraryDocumentList without the cast

        /* Initalize documentIds. */
        let oldThis = this;
        libraryDocumentList.forEach(function(doc: any) {
          oldThis.documentIds.push(doc.id);
        });

        /* Set up the FormArray that will be used to display the list of documents to the user. */
        this.populateDocForm(libraryDocumentList);
      }
    }, error => {
      console.log('ERROR oh no we hit a iceberg! ahhhhhhhhh!', error);
    });
  }

  upload() {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    let selectedDocs: boolean[] = [];
    this.documents.controls.forEach(function(group: FormGroup) {
      selectedDocs.push(group.value.include !== false); // in this context, '' functions as true and false as false
    });

    /* For each document: if that document was selected, upload it. */
    for (let i = 0; i < selectedDocs.length; i ++) {
      if (selectedDocs[i])
        this.uploadHelper(this.documentIds[i]);
    }
  }

  uploadHelper(documentId: string) {
    console.log(`Uploading document with the following ID: ${documentId}`);
  }

  ngOnInit() {
  }

}
