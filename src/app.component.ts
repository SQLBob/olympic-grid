import { Component } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { AgGridAngular } from "ag-grid-angular";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  IDatasource,
  IGetRowsParams,
  RowModelType,
  createGrid,
} from "ag-grid-community";
import { IOlympicData } from "./interfaces";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [AgGridAngular, HttpClientModule],
  template: `<ag-grid-angular
    style="height: 500px"
    [columnDefs]="columnDefs"
    [defaultColDef]="defaultColDef"
    [rowBuffer]="rowBuffer"
    [rowSelection]="rowSelection"
    [rowModelType]="rowModelType"
    [cacheBlockSize]="cacheBlockSize"
    [cacheOverflowSize]="cacheOverflowSize"
    [maxConcurrentDatasourceRequests]="maxConcurrentDatasourceRequests"
    [infiniteInitialRowCount]="infiniteInitialRowCount"
    [maxBlocksInCache]="maxBlocksInCache"
    [rowData]="rowData"
    [class]="themeClass"
    (gridReady)="onGridReady($event)"
  ></ag-grid-angular> `,
})
export class AppComponent {
  public columnDefs: ColDef[] = [
    // this row shows the row index, doesn't use any data from the row
    {
      headerName: "ID",
      maxWidth: 100,
      // it is important to have node.id here, so that when the id changes (which happens
      // when the row is loaded) then the cell is refreshed.
      valueGetter: "node.id",
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
        }
      },
    },
    { field: "athlete", minWidth: 150 },
    { field: "age" },
    { field: "country", minWidth: 150 },
    { field: "year" },
    { field: "date", minWidth: 150 },
    { field: "sport", minWidth: 150 },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: false,
  };
  public rowBuffer = 0;
  public rowSelection: "single" | "multiple" = "multiple";
  public rowModelType: RowModelType = "infinite";
  public cacheBlockSize = 100;
  public cacheOverflowSize = 2;
  public maxConcurrentDatasourceRequests = 1;
  public infiniteInitialRowCount = 1000;
  public maxBlocksInCache = 10;
  public rowData!: IOlympicData[];
  public themeClass: string =
    "ag-theme-quartz";

  constructor(private http: HttpClient) {}

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<
        IOlympicData[]
      >("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .subscribe((data) => {
        const dataSource: IDatasource = {
          rowCount: undefined,
          getRows: (params: IGetRowsParams) => {
            console.log(
              "asking for " + params.startRow + " to " + params.endRow,
            );
            // At this point in your code, you would call the server.
            // To make the demo look real, wait for 500ms before returning
            setTimeout(() => {
              // take a slice of the total rows
              const rowsThisPage = data.slice(params.startRow, params.endRow);
              // if on or after the last page, work out the last row.
              let lastRow = -1;
              if (data.length <= params.endRow) {
                lastRow = data.length;
              }
              // call the success callback
              params.successCallback(rowsThisPage, lastRow);
            }, 500);
          },
        };
        params.api!.setGridOption("datasource", dataSource);
      });
  }
}
