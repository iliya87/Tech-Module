using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Blog.Models
{
    public class Comment
    {
        public int id { get; set; }
        public string text { get; set; }
        public Post Post { get; set; }
    }
}