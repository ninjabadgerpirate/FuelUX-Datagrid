using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Datagrid.Controllers.Api
{
    public class GlobalEntityController : ApiController
    {
        private GeniSysEntities db = new GeniSysEntities();

        // GET: api/GlobalEntities
        public IList<GlobalEntity> GetGlobalEntity()
        {
            db.Configuration.ProxyCreationEnabled = false;
            return db.GlobalEntity.Take(700).OrderBy(x => Guid.NewGuid()).ToList();
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