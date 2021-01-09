export class Vacation {
  public constructor(
    public vacationId?: number,
    public name?: string,
    public start_date?: string,
    public end_date?: string,
    public price?: number,
    public description?: string,
    public destination?: string,
    public img_src?: File,
    public imgSrcString?: string,
    public isFollowed?: boolean
  ) {}
}
