using System.Web.Mvc;
using Datagrid.Model;

namespace Datagrid.Controllers
{
    public class SharedController : Controller
    {
        // GET: Shared
        public ActionResult Datagrid(DatagridViewModel datagridViewModel)
        {
            return PartialView("_Datagrid", datagridViewModel);
        }
    }
}