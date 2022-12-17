import { Backend } from './backend';

export class Github {
  static prs: null | any = null;

  // singleton accessor for PR data
  static async pullRequests(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      if (Github.prs == null) {
        await Backend.instance()
          .getJson(
            'https://api.github.com/repos/HDR-Development/HewDraw-Remix/pulls?per_page=15&state=closed'
          )
          .then((data) => (Github.prs = data))
          .catch((e) => reject(e));
      }
      resolve(Github.prs);
    });
  }
}
