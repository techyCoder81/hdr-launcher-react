import { Backend } from './backend';

export class Github {
  private static prs: null | any = null;

  // singleton accessor for PR data
  static async pullRequests(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      if (Github.prs == null) {
        await Backend.instance()
          .getJson(
            'https://api.github.com/repos/HDR-Development/HewDraw-Remix/pulls?per_page=100&state=open'
          )
          .then((data) => (Github.prs = data))
          .catch((e) => reject(e));
      }
      resolve(Github.prs);
    });
  }
}
