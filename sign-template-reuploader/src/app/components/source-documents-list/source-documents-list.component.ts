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

  /* Fields internal to this component. */
  documentIds: string[] = [];
  readyForDownload: boolean = false;

  /* Fields input by user. */
  selectedDocs: boolean[] = [];
  oauthClientId: string = '';
  loginEmail: string = '';

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
    console.log('starting call, mang! hold on a you asses!');

    documentsCall.subscribe(data => {
      console.log('we gots a thing, mang', data);
      if (data.status === 200) {
        console.log('shit was successful, mang! time a getta beer!');
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
      console.log('oh no we hit a iceberg! ahhhhhhhhh!', error);
    });
  }

  upload() {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    let oldThis = this;
    this.documents.controls.forEach(function(group: FormGroup) {
      oldThis.selectedDocs.push(group.value.include !== false); // in this context, '' functions as true and false as false
    });

    /* For each document: if that document was selected, upload it. */
    let temp = 1; // once done getting uploadHelper() working, delete "&& i < temp" in the below
    for (let i = 0; i < this.selectedDocs.length && i < temp; i ++) {
      if (this.selectedDocs[i])
        this.uploadHelper(this.documentIds[i]);
    }
  }

  uploadHelper(documentId: string) {
    console.log(`Uploading document with the following ID: ${documentId}`);
    console.log(`OAuth client_id: ${this.oauthClientId}`);
    console.log(`email: ${this.loginEmail}`);
  }

  login() {
    console.log("login() clicked.")
  }

  ngOnInit() {
  }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

}
