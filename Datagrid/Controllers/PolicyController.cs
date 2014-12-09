using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Datagrid.Controllers
{
    public class PolicyController : ApiController
    {
        private GeniSysEntities db = new GeniSysEntities();

        // GET: api/Policy
        public List<Policy> GetPolicy(string GlobalEntityID)
        {
            var guid = new Guid(GlobalEntityID);
            db.Configuration.ProxyCreationEnabled = false;
            return db.Policy.Where(x => x.GlobalEntityID == guid).ToList();
        }

        // GET: api/Policy
        public List<Policy> GetPolicyByGlobalEntityID(string GlobalEntityID, string PolicyNo)
        {
            var guid = new Guid(GlobalEntityID);
            db.Configuration.ProxyCreationEnabled = false;
            return db.Policy.Where(x => x.PolicyNo == PolicyNo && x.GlobalEntityID == guid).ToList();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}