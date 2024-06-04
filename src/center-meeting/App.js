export default function CenterMeetingApp() {
    return (
        <>
            <div class="col-3 p-0">
                <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
                    <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                        <span class="fs-5 fw-semibold">Locations</span>
                    </div>
                    <div id="location-list" class="list-group list-group-flush border-bottom scrollarea">
                        <div class="list-group-item py-3 lh-tight">
                            <div class="d-flex w-100 align-items-center justify-content-between">
                                <strong class="mb-1">Someone's House</strong>
                                <button type="button" class="btn btn-default">
                                    <small><i class="fa fa-trash"></i></small>
                                </button>
                            </div>
                            <div class="col-10 mb-1 small"><b>Address:</b> 123 Placeholder Drive, Downtown, America City
                                12345</div>
                        </div>
                        <div class="list-group-item py-3 lh-tight">
                            <div class="d-flex w-100 align-items-center justify-content-between">
                                <strong class="mb-1">Random POI</strong>
                                <button type="button" class="btn btn-default">
                                    <small><i class="fa fa-trash"></i></small>
                                </button>
                            </div>
                            <div class="col-10 mb-1 small"><b>Lat/Long:</b> [42.9777086, -85.6831788]</div>
                        </div>
                        <div class="list-group-item list-group-item-action py-3 lh-tight mouseover-action">
                            <div class="align-items-center">
                                <i class="fa fa-circle-plus"></i>
                                Add Location
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1 p-0">
                <div class="b-divider"></div>
            </div>
            <div class="col">
                <img class="img-fluid" src="/dist/assets/img/under-construction.png" alt="..." />
            </div>
        </>
    );
}
